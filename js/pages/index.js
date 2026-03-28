let fetchedUser = null;
let secondChance = true;

sessionStorage.clear();

document.addEventListener('DOMContentLoaded', initIndexPage);

/**
 * onload-helper: initialize page view depending on url parameter.
 */
function initIndexPage() {
  toggleIndexView();
}

/**
 * onload-function: handles start animation, remove overlay when finished.
 * prevents false positioning when page is reloaded
 */
function removeOverlay() {
  const overlay = document.querySelector('.idx-overlay');
  const logo = document.querySelector('.floating-logo');

  if (!overlay || !logo) return;

  overlay.classList.remove('d-none');
  logo.classList.add('animate');

  setTimeout(() => {
    overlay.classList.add('d-none');
    toggleIndexView();
  }, 1000);
}

/**
 * helper function for page initialization; check url parameter and show corresponding view.
 */
function toggleIndexView() {
  const stakeholderEntryView = document.getElementById('stakeholder-entry-view');
  const loginView = document.getElementById('login-view');

  if (!stakeholderEntryView || !loginView) return;

  const urlParams = new URLSearchParams(window.location.search);
  const currentView = urlParams.get('view');

  if (currentView === 'login') {
    showLoginView(loginView, stakeholderEntryView);
  } else {
    showEntryView(loginView, stakeholderEntryView);
  }
}

/**
 * helper function for "toggleIndexView"; show login section and hide entry section.
 * @param {HTMLElement} loginView
 * @param {HTMLElement} stakeholderEntryView
 */
function showLoginView(loginView, stakeholderEntryView) {
  stakeholderEntryView.classList.add('d-none');
  loginView.classList.remove('d-none');
}

/**
 * helper function for "toggleIndexView"; show entry section and hide login section.
 * @param {HTMLElement} loginView
 * @param {HTMLElement} stakeholderEntryView
 */
function showEntryView(loginView, stakeholderEntryView) {
  loginView.classList.add('d-none');
  stakeholderEntryView.classList.remove('d-none');
}

/**
 * onclick-function of "Login"-button. check whether input fields are filled.
 */
function handleLogin() {
  clearRedAlerts();
  const userEmail = document.getElementById('login-email').value.trim();
  const userPw = document.getElementById('login-password').value.trim();

  if (!userEmail) return blameEmptyInput('login-email', 'alert-login');
  if (!userPw) return blameEmptyInput('login-password', 'alert');

  startValidation(userEmail, userPw);
}

/**
 * helper function for "handleLogin"; start validation process for user login.
 * @param {string} userEmail
 * @param {string} userPw
 */
async function startValidation(userEmail, userPw) {
  await checkUserInFirebase('users', 'email', userEmail);
  validateLogin(userPw);
}

/**
 * check in database whether a user-dataset contains the email corresponding to the login-input.
 * @param {string} category - database category to check in
 * @param {string} databaseKey - database key to check against
 * @param {string} inputString - input value from login field
 */
// async function checkUserInFirebase(category, databaseKey, inputString) {
//   let queryString = `?orderBy=%22${databaseKey}%22&equalTo=%22${encodeURIComponent(inputString.toLowerCase())}%22`;
//   const data = await getFirebaseData(category, queryString);
//   fetchedUser = data;
// }

/**
 * helper function for "checkUserInFirebase"; check whether login is valid.
 * @param {string} userPw
 */
function validateLogin(userPw) {
  const validEmail = checkEmail();
  if (!validEmail) return;

  const validPw = validatePassword(userPw);
  if (!validPw) return;

  setSessionStorage();
  window.location.href = 'html/summary.html';
}

/**
 * helper function for "validateLogin"; if email is not found in database,
 * "fetchedUser" is empty and email check false.
 * @returns boolean
 */
function checkEmail() {
  if (!fetchedUser || Object.keys(fetchedUser).length === 0) {
    tryAgain();
    return false;
  }

  return true;
}

/**
 * helper function for "validateLogin"; if email is correct,
 * compare password from input to password in "fetchedUser".
 * @param {string} userPw - user password from login input.
 * @returns boolean
 */
function validatePassword(userPw) {
  const userDetails = Object.values(fetchedUser)[0];
  const foundPassword = userDetails.password == userPw;

  if (!foundPassword) {
    tryAgain();
    return false;
  }

  return true;
}

/**
 * helper function for "validatePassword"; if user made a typo, he gets a second chance
 * to write the password correctly. If password is still false: -> sign up.
 * @returns boolean
 */
function tryAgain() {
  if (secondChance == true) {
    loginAlert();
    secondChance = false;
    return false;
  } else {
    blameInvalidInput('alert-login', 'login-email', 'Unkown user. Please sign up');
    goToPage('html/sign-up.html');
  }
}

/**
 * helper function for "validateLogin"; get user name from "fetchedUser", set name to sessionStorage.
 */
function setSessionStorage() {
  const userDetails = Object.values(fetchedUser)[0];
  const displayName = userDetails.displayName;
  sessionStorage.setItem('currentUser', displayName);
  initialsForHeader(displayName);
}

/**
 * helper function for "setSessionStorage"; set initials for "header", to sessionStorage.
 * @param {string} displayName - user name corresponding to email-address
 */
function initialsForHeader(displayName) {
  const initials = getInitials(displayName);
  sessionStorage.setItem('headerInitials', initials);
}

/**
 * helper function for "initialsForHeader"; get initials from first and last part of user name.
 * @param {string} fullName - user name
 * @returns initials (string).
 */
function getInitials(fullName) {
  const names = fullName.trim().split(' ');

  if (names.length == 0) return '';

  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';

  return first + last;
}

/**
 * helper function for "validateLogin"; show alert message and add red input borders.
 */
function loginAlert() {
  document.getElementById('login-email').closest('.input-frame').classList.add('active');
  document.getElementById('login-password').closest('.input-frame').classList.add('active');
  document.getElementById('alert').classList.remove('d-none');
}