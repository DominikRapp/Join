const FIREBASE_BASE_URL = 'https://mein-join-d19ba-default-rtdb.europe-west1.firebasedatabase.app';
const REQUEST_LIMIT_PATH = 'emailRequestLimit';
const ISSUE_COLLECTOR_PATH = 'issueCollector';

document.addEventListener('DOMContentLoaded', initStakeholderRequestPage);

/**
 * Initializes the stakeholder request page by loading the current request limit data,
 * synchronizing it with the current day, and rendering the page state accordingly.
 * @returns {Promise<void>} Resolves when the page has been fully initialized.
 */
async function initStakeholderRequestPage() {
    const elements = getStakeholderElements();
    if (!areRequiredElementsAvailable(elements)) return;
    const [rawRequestData, collectorData] = await Promise.all([getRequestLimitData(), getIssueCollectorData(),]);
    const requestData = await ensureCurrentRequestLimitData(rawRequestData);
    const usedRequests = getUsedRequests(requestData);
    const remainingRequests = getRemainingRequests(requestData.dailyLimit, usedRequests);
    renderRequestPageState(
        elements,
        usedRequests,
        remainingRequests,
        requestData.dailyLimit,
        collectorData
    );
}

/**
 * Ensures that the request limit data matches the current day.
 * If the stored date is outdated, the Firebase data is reset for today
 * with the existing daily limit and a request count of 0.
 * @param {{dailyLimit: number, currentDate: string, requestCount: number}} requestData - The current request limit data.
 * @returns {Promise<{dailyLimit: number, currentDate: string, requestCount: number}>} The current or reset request limit data.
 */
async function ensureCurrentRequestLimitData(requestData) {
    if (requestData.currentDate === getTodayKey()) {
        return requestData;
    }
    const resetData = { dailyLimit: requestData.dailyLimit || 10, currentDate: getTodayKey(), requestCount: 0, };
    try {
        await fetch(`${FIREBASE_BASE_URL}/${REQUEST_LIMIT_PATH}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(resetData),
        });
        return resetData;
    } catch (error) { return resetData; }
}

/**
 * Loads the issue collector configuration from Firebase.
 * Falls back to default values if the request fails or no valid data is available.
 * @returns {Promise<{email: string, mailSubject: string}>} The issue collector email configuration.
 */
async function getIssueCollectorData() {
    try {
        const response = await fetch(`${FIREBASE_BASE_URL}/${ISSUE_COLLECTOR_PATH}.json`);
        if (!response.ok) {
            throw new Error(`Firebase request failed: ${response.status}`);
        }
        const data = await response.json();
        return { email: data?.email || 'albachi@gmx.at', mailSubject: data?.mailSubject || 'New Request', };
    } catch (error) {
        return { email: 'albachi@gmx.at', mailSubject: 'New Request', };
    }
}

/**
 * Collects all required DOM elements for the stakeholder request page.
 * @returns {{
 *   requestCounter: HTMLElement | null,
 *   limitTextElement: HTMLElement | null,
 *   createRequestLink: HTMLElement | null,
 *   createRequestLinkClosed: HTMLElement | null,
 *   requestOpenView: HTMLElement | null,
 *   requestClosedView: HTMLElement | null
 * }} The relevant DOM elements used on the page.
 */
function getStakeholderElements() {
    return {
        requestCounter: document.querySelector('.request-counter'),
        limitTextElement: document.getElementById('stakeholder-limit-text'),
        createRequestLink: document.getElementById('create-request-link'),
        createRequestLinkClosed: document.getElementById('create-request-link-closed'),
        requestOpenView: document.getElementById('request-open-view'),
        requestClosedView: document.getElementById('request-closed-view'),
    };
}

/**
 * Checks whether all required DOM elements for page initialization are available.
 * @param {object} elements - The collected DOM elements.
 * @returns {boolean} True if all required elements exist, otherwise false.
 */
function areRequiredElementsAvailable(elements) {
    return !!(
        elements.requestCounter &&
        elements.limitTextElement &&
        elements.requestOpenView &&
        elements.requestClosedView
    );
}

/**
 * Loads the current request limit data from Firebase.
 * Falls back to a default request limit object if the request fails.
 * @returns {Promise<{dailyLimit: number, currentDate: string, requestCount: number}>} The normalized request limit data.
 */
async function getRequestLimitData() {
    try {
        const response = await fetch(`${FIREBASE_BASE_URL}/${REQUEST_LIMIT_PATH}.json`);
        if (!response.ok) {
            throw new Error(`Firebase request failed: ${response.status}`);
        }
        const data = await response.json();
        return normalizeRequestLimitData(data);
    } catch (error) {
        return { dailyLimit: 10, currentDate: getTodayKey(), requestCount: 0, };
    }
}

/**
 * Normalizes raw Firebase request limit data into a stable internal structure.
 * Ensures fallback values for missing or invalid fields.
 * @param {object | null} data - The raw request limit data from Firebase.
 * @returns {{dailyLimit: number, currentDate: string, requestCount: number}} The normalized request limit data.
 */
function normalizeRequestLimitData(data) {
    return {
        dailyLimit: Number(data?.dailyLimit) || 10,
        currentDate: data?.currentDate || '',
        requestCount: Number(data?.requestCount) || 0,
    };
}

/**
 * Renders the complete stakeholder request page state,
 * including visibility, counter styling, limit text, and request links.
 * @param {object} elements - The DOM elements used for rendering.
 * @param {number} usedRequests - The number of requests already used today.
 * @param {number} remainingRequests - The number of requests still available today.
 * @param {number} dailyLimit - The maximum number of requests allowed per day.
 * @param {{email: string, mailSubject: string}} collectorData - The issue collector configuration.
 */
function renderRequestPageState(elements, usedRequests, remainingRequests, dailyLimit, collectorData) {
    toggleRequestState(
        elements.requestOpenView,
        elements.requestClosedView,
        remainingRequests
    );
    updateCounterState(elements.requestCounter, usedRequests, dailyLimit);
    updateLimitText(elements.limitTextElement, usedRequests, dailyLimit);
    updateCreateRequestLinks(elements.createRequestLink, elements.createRequestLinkClosed, remainingRequests, collectorData);
}

/**
 * Toggles the open or closed request view depending on the remaining daily quota.
 * @param {HTMLElement} requestOpenView - The container shown when requests are still available.
 * @param {HTMLElement} requestClosedView - The container shown when the request limit has been reached.
 * @param {number} remainingRequests - The number of requests still available today.
 */
function toggleRequestState(requestOpenView, requestClosedView, remainingRequests) {
    if (remainingRequests > 0) {
        showOpenRequestView(requestOpenView, requestClosedView);
        return;
    }
    showClosedRequestView(requestOpenView, requestClosedView);
}

/**
 * Displays the open request state and hides the closed request state.
 * @param {HTMLElement} requestOpenView - The open state container.
 * @param {HTMLElement} requestClosedView - The closed state container.
 */
function showOpenRequestView(requestOpenView, requestClosedView) {
    requestOpenView.classList.remove('d-none');
    requestClosedView.classList.add('d-none');
}

/**
 * Displays the closed request state and hides the open request state.
 * @param {HTMLElement} requestOpenView - The open state container.
 * @param {HTMLElement} requestClosedView - The closed state container.
 */
function showClosedRequestView(requestOpenView, requestClosedView) {
    requestOpenView.classList.add('d-none');
    requestClosedView.classList.remove('d-none');
}

/**
 * Updates the visual state of the request counter based on the current usage.
 * @param {HTMLElement} requestCounter - The counter element.
 * @param {number} usedRequests - The number of requests already used today.
 * @param {number} dailyLimit - The maximum number of requests allowed per day.
 */
function updateCounterState(requestCounter, usedRequests, dailyLimit) {
    if (usedRequests >= dailyLimit) {
        setCounterClosedState(requestCounter);
        return;
    }
    setCounterOpenState(requestCounter);
}

/**
 * Applies the closed-state styling to the request counter.
 * @param {HTMLElement} requestCounter - The counter element.
 */
function setCounterClosedState(requestCounter) {
    requestCounter.classList.add('is-closed');
}

/**
 * Applies the open-state styling to the request counter.
 * @param {HTMLElement} requestCounter - The counter element.
 */
function setCounterOpenState(requestCounter) {
    requestCounter.classList.remove('is-closed');
}

/**
 * Returns the number of used requests for the current day.
 * If the stored data belongs to a different day, 0 is returned.
 * The result is clamped between 0 and the configured daily limit.
 * @param {{dailyLimit: number, currentDate: string, requestCount: number}} requestData - The request limit data.
 * @returns {number} The number of used requests for today.
 */
function getUsedRequests(requestData) {
    if (requestData.currentDate !== getTodayKey()) {
        return 0;
    }
    return Math.min(requestData.dailyLimit, Math.max(0, requestData.requestCount));
}

/**
 * Calculates the number of remaining requests for the current day.
 * The result is never lower than 0.
 * @param {number} dailyLimit - The maximum number of requests allowed per day.
 * @param {number} usedRequests - The number of requests already used today.
 * @returns {number} The number of remaining requests.
 */
function getRemainingRequests(dailyLimit, usedRequests) {
    return Math.max(0, dailyLimit - usedRequests);
}

/**
 * Updates the request limit text displayed on the page.
 * @param {HTMLElement} limitTextElement - The element that shows the limit text.
 * @param {number} usedRequests - The number of requests already used today.
 * @param {number} dailyLimit - The maximum number of requests allowed per day.
 */
function updateLimitText(limitTextElement, usedRequests, dailyLimit) {
    limitTextElement.innerHTML = buildLimitTextMarkup(usedRequests, dailyLimit);
}

/**
 * Builds the HTML markup for the daily request usage display.
 * @param {number} usedRequests - The number of requests already used today.
 * @param {number} dailyLimit - The maximum number of requests allowed per day.
 * @returns {string} The HTML string for the request usage text.
 */
function buildLimitTextMarkup(usedRequests, dailyLimit) {
    return `
        <span id="requests-left" class="request-counter-value">${usedRequests}</span>
        <span class="request-counter-suffix">
            of <span class="request-counter-max">${dailyLimit}</span> requests used today
        </span>
    `;
}

/**
 * Updates the mailto links for the available request actions.
 * The open-state link is only updated when requests are still available.
 * The closed-state link is always updated with manual mode.
 * @param {HTMLElement | null} createRequestLink - The link shown in the open request state.
 * @param {HTMLElement | null} createRequestLinkClosed - The link shown in the closed request state.
 * @param {number} remainingRequests - The number of requests still available today.
 * @param {{email: string, mailSubject: string}} collectorData - The issue collector configuration.
 */
function updateCreateRequestLinks(createRequestLink, createRequestLinkClosed, remainingRequests, collectorData) {
    if (createRequestLink && remainingRequests > 0) {
        updateMailLink(createRequestLink, collectorData, 'ai');
    }
    if (createRequestLinkClosed) {
        updateMailLink(createRequestLinkClosed, collectorData, 'manual');
    }
}

/**
 * Updates a request link with the generated mailto URL.
 * @param {HTMLElement} createRequestLink - The link element to update.
 * @param {{email: string, mailSubject: string}} collectorData - The issue collector configuration.
 * @param {'ai' | 'manual'} requestMode - The request mode used to build the mailto link.
 */
function updateMailLink(createRequestLink, collectorData, requestMode) {
    createRequestLink.setAttribute('href', buildMailToLink(collectorData, requestMode));
}

/**
 * Builds the complete mailto URL for creating a new request email.
 * @param {{email: string, mailSubject: string}} collectorData - The issue collector configuration.
 * @param {'ai' | 'manual'} requestMode - The request mode used for the email.
 * @returns {string} The generated mailto URL.
 */
function buildMailToLink(collectorData, requestMode) {
    const subject = buildMailSubject(collectorData.mailSubject, requestMode);
    const body = buildMailBody(requestMode);

    return `mailto:${collectorData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds the email subject line for a stakeholder request.
 * Adds a mode-specific label to the configured base subject.
 * @param {string} baseSubject - The configured base subject.
 * @param {'ai' | 'manual'} requestMode - The request mode used for the email.
 * @returns {string} The formatted email subject.
 */
function buildMailSubject(baseSubject, requestMode) {
    const normalizedBaseSubject = baseSubject || 'Join Request';
    const modeLabel = requestMode === 'manual' ? 'MANUAL' : 'AI';
    return `[JOIN-ISSUE][${modeLabel}] ${normalizedBaseSubject}`;
}

/**
 * Builds the email body template for a stakeholder request.
 * Includes the selected request mode and source metadata.
 * @param {'ai' | 'manual'} requestMode - The request mode used for the email.
 * @returns {string} The formatted email body.
 */
function buildMailBody(requestMode) {
    const modeLabel = requestMode === 'manual' ? 'manual' : 'ai';
    return [
        'Please describe your request below:',
        '',
        'Title:',
        '',
        'Description:',
        '',
        'Preferred deadline:',
        '',
        `Join Request Mode: ${modeLabel}`,
        'Join Request Source: stakeholder-page'
    ].join('\n');
}

/**
 * Redirects the user back to the index page.
 */
function goBackToIndex() {
    window.location.href = '../index.html';
}

/**
 * Returns the current date as a YYYY-MM-DD key string.
 * @returns {string} The current date formatted as YYYY-MM-DD.
 */
function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = getPaddedMonth(today);
    const day = getPaddedDay(today);
    return `${year}-${month}-${day}`;
}

/**
 * Returns the month of the given date as a two-digit string.
 * @param {Date} today - The date object to read the month from.
 * @returns {string} The two-digit month value.
 */
function getPaddedMonth(today) {
    return String(today.getMonth() + 1).padStart(2, '0');
}

/**
 * Returns the day of the month of the given date as a two-digit string.
 * @param {Date} today - The date object to read the day from.
 * @returns {string} The two-digit day value.
 */
function getPaddedDay(today) {
    return String(today.getDate()).padStart(2, '0');
}