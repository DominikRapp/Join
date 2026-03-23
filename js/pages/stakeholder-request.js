const dailyRequestLimit = 10;
const storageKey = 'joinStakeholderRequests';

document.addEventListener('DOMContentLoaded', initStakeholderRequestPage);

/**
 * onload-function: initialize stakeholder request page and show current request state.
 */
function initStakeholderRequestPage() {
    const elements = getStakeholderElements();
    if (!areRequiredElementsAvailable(elements)) return;
    const requestData = getStoredRequestData();
    const usedRequests = getUsedRequests(requestData.count);
    const remainingRequests = getRemainingRequests(usedRequests);
    renderRequestPageState(elements, usedRequests, remainingRequests);
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
 * render complete request page state.
 * @param {object} elements
 * @param {number} usedRequests
 * @param {number} remainingRequests
 */
function renderRequestPageState(elements, usedRequests, remainingRequests) {
    toggleRequestState(
        elements.requestOpenView,
        elements.requestClosedView,
        remainingRequests
    );
    updateCounterState(elements.requestCounter, usedRequests);
    updateLimitText(elements.limitTextElement, usedRequests);
    updateCreateRequestLink(elements.createRequestLink, remainingRequests);
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
 */
function updateCounterState(requestCounter, usedRequests) {
    if (usedRequests >= dailyRequestLimit) {
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
 * helper function for page initialization; get stored request counter for current day.
 * @returns {{date: string, count: number}}
 */
function getStoredRequestData() {
    const today = getTodayKey();
    const rawData = localStorage.getItem(storageKey);
    if (!rawData) {
        return createAndSaveDefaultRequestData(today);
    }
    return parseStoredRequestData(rawData, today);
}

/**
 * parse stored request data and reset if invalid or outdated.
 * @param {string} rawData
 * @param {string} today
 * @returns {{date: string, count: number}}
 */
function parseStoredRequestData(rawData, today) {
    try {
        const parsedData = JSON.parse(rawData);
        return validateStoredRequestData(parsedData, today);
    } catch (error) {
        return createAndSaveDefaultRequestData(today);
    }
}

/**
 * validate stored request data for current day.
 * @param {object} parsedData
 * @param {string} today
 * @returns {{date: string, count: number}}
 */
function validateStoredRequestData(parsedData, today) {
    if (parsedData.date !== today) {
        return createAndSaveDefaultRequestData(today);
    }
    return createRequestDataObject(parsedData.date, parsedData.count);
}

/**
 * create, save and return default request data.
 * @param {string} today
 * @returns {{date: string, count: number}}
 */
function createAndSaveDefaultRequestData(today) {
    const defaultData = createDefaultRequestData(today);
    saveRequestData(defaultData);
    return defaultData;
}

/**
 * helper function for "getStoredRequestData"; create default request data object.
 * @param {string} date
 * @returns {{date: string, count: number}}
 */
function createDefaultRequestData(date) {
    return {
        date,
        count: 0,
    };
}

/**
 * create normalized request data object.
 * @param {string} date
 * @param {number} count
 * @returns {{date: string, count: number}}
 */
function createRequestDataObject(date, count) {
    return {
        date,
        count: Number(count) || 0,
    };
}

/**
 * helper function for request data handling; save request data in localStorage.
 * @param {object} data
 */
function saveRequestData(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
}

/**
 * helper function for request data handling; get number of used requests.
 * @param {number} count
 * @returns {number}
 */
function getUsedRequests(count) {
    return Math.min(dailyRequestLimit, Math.max(0, Number(count) || 0));
}

/**
 * helper function for request data handling; calculate remaining requests.
 * @param {number} usedRequests
 * @returns {number}
 */
function getRemainingRequests(usedRequests) {
    return Math.max(0, dailyRequestLimit - usedRequests);
}

/**
 * helper function for page initialization; update request limit text.
 * @param {HTMLElement} limitTextElement
 * @param {number} usedRequests
 */
function updateLimitText(limitTextElement, usedRequests) {
    limitTextElement.innerHTML = buildLimitTextMarkup(usedRequests);
}

/**
 * build markup for used requests text.
 * @param {number} usedRequests
 * @returns {string}
 */
function buildLimitTextMarkup(usedRequests) {
    return `
        <span id="requests-left" class="request-counter-value">${usedRequests}</span>
        <span class="request-counter-suffix">
            of <span class="request-counter-max">${dailyRequestLimit}</span> requests used today
        </span>
    `;
}

/**
 * update mail link only if requests are still available.
 * @param {HTMLElement | null} createRequestLink
 * @param {number} remainingRequests
 */
function updateCreateRequestLink(createRequestLink, remainingRequests) {
    if (!createRequestLink || remainingRequests <= 0) return;
    updateMailLink(createRequestLink);
}

/**
 * helper function for page initialization; set mailto link for request creation.
 * @param {HTMLElement} createRequestLink
 */
function updateMailLink(createRequestLink) {
    createRequestLink.setAttribute('href', buildMailToLink());
}

/**
 * build mailto link for request creation.
 * @returns {string}
 */
function buildMailToLink() {
    return 'mailto:requests@example.com?subject=New%20Request&body=Hello%20Join%20team,%0A%0AI%20would%20like%20to%20submit%20the%20following%20request:%0A%0A';
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

/**
 * create request data for fully used daily limit.
 * @returns {{date: string, count: number}}
 */
function createClosedRequestData() {
    return {
        date: getTodayKey(),
        count: dailyRequestLimit,
    };
}

/**
 * helper function for testing; force open request state and reload page.
 */
function setOpenStateForTesting() {
    saveRequestData(createDefaultRequestData(getTodayKey()));
    location.reload();
}

/**
 * helper function for testing; force closed request state and reload page.
 */
function setClosedStateForTesting() {
    saveRequestData(createClosedRequestData());
    location.reload();
}
