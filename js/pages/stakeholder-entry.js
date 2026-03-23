document.addEventListener('DOMContentLoaded', initStakeholderEntry);

/**
 * onload-function: initialize stakeholder entry page.
 */
function initStakeholderEntry() {
    bindNavigation();
}

/**
 * bind click events for stakeholder entry navigation buttons.
 */
function bindNavigation() {
    const memberLoginButton = document.querySelector('[data-action="member-login"]');
    const createRequestButton = document.querySelector('[data-action="create-request"]');

    if (memberLoginButton) {
        memberLoginButton.addEventListener('click', handleMemberLogin);
    }

    if (createRequestButton) {
        createRequestButton.addEventListener('click', handleCreateRequest);
    }
}

/**
 * redirect user to login view.
 */
function handleMemberLogin() {
    window.location.href = './index.html?view=login';
}

/**
 * redirect user to stakeholder request page.
 */
function handleCreateRequest() {
    window.location.href = './html/stakeholder-request.html';
}