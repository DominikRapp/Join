const FIREBASE_BASE_URL = 'https://mein-join-d19ba-default-rtdb.europe-west1.firebasedatabase.app';
const REQUEST_LIMIT_PATH = 'emailRequestLimit';
const ISSUE_COLLECTOR_PATH = 'issueCollector';

document.addEventListener('DOMContentLoaded', initStakeholderRequestPage);

/**
 * onload-function: initialize stakeholder request page and show current request state.
 * @returns {Promise<void>}
 */
async function initStakeholderRequestPage() {
    const elements = getStakeholderElements();
    if (!areRequiredElementsAvailable(elements)) return;
    const [requestData, collectorData] = await Promise.all([
        getRequestLimitData(),
        getIssueCollectorData(),
    ]);
    const usedRequests = getUsedRequests(requestData);
    const remainingRequests = getRemainingRequests(requestData.dailyLimit, usedRequests);
    renderRequestPageState(elements, usedRequests, remainingRequests, requestData.dailyLimit, collectorData);
}

/**
 * load issue collector config from Firebase.
 * @returns {Promise<{email: string, mailSubject: string}>}
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
 * collect all required DOM elements for stakeholder request page.
 * @returns {object}
 */
function getStakeholderElements() {
    return {
        requestCounter: document.querySelector('.request-counter'),
        limitTextElement: document.getElementById('stakeholder-limit-text'),
        createRequestLink: document.getElementById('create-request-link'),
        requestOpenView: document.getElementById('request-open-view'),
        requestClosedView: document.getElementById('request-closed-view'),
    };
}

/**
 * check if all required DOM elements are available.
 * @param {object} elements
 * @returns {boolean}
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
 * load current request limit data from Firebase.
 * @returns {Promise<{dailyLimit: number, currentDate: string, requestCount: number}>}
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
 * normalize raw Firebase request limit data.
 * @param {object | null} data
 * @returns {{dailyLimit: number, currentDate: string, requestCount: number}}
 */
function normalizeRequestLimitData(data) {
    return {
        dailyLimit: Number(data?.dailyLimit) || 10,
        currentDate: data?.currentDate || '',
        requestCount: Number(data?.requestCount) || 0,
    };
}

/**
 * render complete request page state.
 * @param {object} elements
 * @param {number} usedRequests
 * @param {number} remainingRequests
 * @param {number} dailyLimit
 */
function renderRequestPageState(elements, usedRequests, remainingRequests, dailyLimit, collectorData) {
    toggleRequestState(
        elements.requestOpenView,
        elements.requestClosedView,
        remainingRequests
    );
    updateCounterState(elements.requestCounter, usedRequests, dailyLimit);
    updateLimitText(elements.limitTextElement, usedRequests, dailyLimit);
    updateCreateRequestLink(elements.createRequestLink, remainingRequests, collectorData);
}

/**
 * helper function for page initialization; show request state depending on remaining daily quota.
 * @param {HTMLElement} requestOpenView
 * @param {HTMLElement} requestClosedView
 * @param {number} remainingRequests
 */
function toggleRequestState(requestOpenView, requestClosedView, remainingRequests) {
    if (remainingRequests > 0) {
        showOpenRequestView(requestOpenView, requestClosedView);
        return;
    }
    showClosedRequestView(requestOpenView, requestClosedView);
}

/**
 * show open request state view.
 * @param {HTMLElement} requestOpenView
 * @param {HTMLElement} requestClosedView
 */
function showOpenRequestView(requestOpenView, requestClosedView) {
    requestOpenView.classList.remove('d-none');
    requestClosedView.classList.add('d-none');
}

/**
 * show closed request state view.
 * @param {HTMLElement} requestOpenView
 * @param {HTMLElement} requestClosedView
 */
function showClosedRequestView(requestOpenView, requestClosedView) {
    requestOpenView.classList.add('d-none');
    requestClosedView.classList.remove('d-none');
}

/**
 * helper function for page initialization; show counter color depending on current request usage.
 * @param {HTMLElement} requestCounter
 * @param {number} usedRequests
 * @param {number} dailyLimit
 */
function updateCounterState(requestCounter, usedRequests, dailyLimit) {
    if (usedRequests >= dailyLimit) {
        setCounterClosedState(requestCounter);
        return;
    }
    setCounterOpenState(requestCounter);
}

/**
 * set counter style to closed state.
 * @param {HTMLElement} requestCounter
 */
function setCounterClosedState(requestCounter) {
    requestCounter.classList.add('is-closed');
}

/**
 * set counter style to open state.
 * @param {HTMLElement} requestCounter
 */
function setCounterOpenState(requestCounter) {
    requestCounter.classList.remove('is-closed');
}

/**
 * helper function for request data handling; get number of used requests for current day.
 * @param {{dailyLimit: number, currentDate: string, requestCount: number}} requestData
 * @returns {number}
 */
function getUsedRequests(requestData) {
    if (requestData.currentDate !== getTodayKey()) {
        return 0;
    }
    return Math.min(requestData.dailyLimit, Math.max(0, requestData.requestCount));
}

/**
 * helper function for request data handling; calculate remaining requests.
 * @param {number} dailyLimit
 * @param {number} usedRequests
 * @returns {number}
 */
function getRemainingRequests(dailyLimit, usedRequests) {
    return Math.max(0, dailyLimit - usedRequests);
}

/**
 * helper function for page initialization; update request limit text.
 * @param {HTMLElement} limitTextElement
 * @param {number} usedRequests
 * @param {number} dailyLimit
 */
function updateLimitText(limitTextElement, usedRequests, dailyLimit) {
    limitTextElement.innerHTML = buildLimitTextMarkup(usedRequests, dailyLimit);
}

/**
 * build markup for used requests text.
 * @param {number} usedRequests
 * @param {number} dailyLimit
 * @returns {string}
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
 * update mail link only if requests are still available.
 * @param {HTMLElement | null} createRequestLink
 * @param {number} remainingRequests
 */
function updateCreateRequestLink(createRequestLink, remainingRequests, collectorData) {
    if (!createRequestLink || remainingRequests <= 0) return;
    updateMailLink(createRequestLink, collectorData);
}

/**
 * helper function for page initialization; set mailto link for request creation.
 * @param {HTMLElement} createRequestLink
 */
function updateMailLink(createRequestLink, collectorData) {
    createRequestLink.setAttribute('href', buildMailToLink(collectorData));
}

/**
 * build mailto link for request creation.
 * @returns {string}
 */
function buildMailToLink(collectorData) {
    const email = encodeURIComponent(collectorData.email);
    const subject = encodeURIComponent(collectorData.mailSubject);
    const body = encodeURIComponent(
        'Hello Join team,\n\nI would like to submit the following request:\n\n'
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * onclick-function of back button; return to index page.
 */
function goBackToIndex() {
    window.location.href = '../index.html';
}

/**
 * helper function for request data handling; get current date as key.
 * @returns {string}
 */
function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = getPaddedMonth(today);
    const day = getPaddedDay(today);
    return `${year}-${month}-${day}`;
}

/**
 * get current month as two-digit string.
 * @param {Date} today
 * @returns {string}
 */
function getPaddedMonth(today) {
    return String(today.getMonth() + 1).padStart(2, '0');
}

/**
 * get current day as two-digit string.
 * @param {Date} today
 * @returns {string}
 */
function getPaddedDay(today) {
    return String(today.getDate()).padStart(2, '0');
}