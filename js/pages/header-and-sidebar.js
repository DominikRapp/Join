/**
 * Initializes the shared page layout by loading the header and sidebar,
 * applying session-based UI logic, and setting up page-specific interactions.
 * @returns {Promise<void>} Resolves when the layout elements have been loaded and initialized.
 */
async function includeHeaderAndSidebar() {
  enforceProtectedPageAccess();
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  partiallyHideSidebar();
  initDropdown();
  bindLogoutActions();
  updateFaviconForTheme();
  highlightCurrentPage();
}

/**
 * Attaches the logout click handler to the logout link in the header dropdown.
 * Does nothing if the logout link is not present on the current page.
 */
function bindLogoutActions() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", handleLogout);
}

/**
 * Handles the logout action by preventing the default link behavior,
 * clearing the current Join session, and redirecting the user to the login view.
 * @param {Event} event - The click event triggered by the logout link.
 */
function handleLogout(event) {
  event.preventDefault();

  clearJoinSession();

  window.location.replace("../index.html?view=login");
}

/**
 * Clears all stored Join session data from sessionStorage, localStorage,
 * and the global window object.
 */
function clearJoinSession() {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("headerInitials");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("headerInitials");
  window.currentUser = null;
}

/**
 * Fetches an HTML template and injects it into the specified target element.
 * @param {string} path - The relative path to the HTML template.
 * @param {string} id - The ID of the target element that should receive the template.
 * @returns {Promise<void>} Resolves when the template has been loaded and inserted.
 */
async function addLayoutElements(path, id) {
  return fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

/**
 * Reads the stored user initials from sessionStorage and displays them
 * inside the header avatar element.
 */
function displayInitialsInHeader() {
  const name = sessionStorage.getItem('headerInitials');
  if (name) {
    document.getElementById('initials').innerText = name;
  }
}

/**
 * Initializes the profile dropdown in the header.
 * Toggles the dropdown on avatar click and closes it when clicking outside.
 */
function initDropdown() {
  const initials = document.getElementById("initials");
  const dropdown = document.getElementById("dropdown");
  initials.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-wrapper")) {
      dropdown.classList.remove("show");
    }
  });
}

/**
 * Adjusts the sidebar for users without an active session.
 * On the privacy policy and legal notice pages, protected navigation items
 * are hidden and the login navigation is shown instead.
 */
function partiallyHideSidebar() {
  const name = sessionStorage.getItem('headerInitials');
  if (!name && (
    window.location.pathname.endsWith("/privacy-policy.html")
    || window.location.pathname.endsWith("/legal-notice.html")
  )) {
    document.getElementById('login-nav').classList.remove("d-none");
    document.getElementById('app-nav').classList.add("hide");
  }
}

/**
 * Highlights the sidebar navigation item that matches the current page.
 */
function highlightCurrentPage() {
  const pageIds = ["summary", "add-task", "board-site", "contacts", "privacy-policy", "legal-notice"];
  const currentPage = pageIds.find(id => window.location.pathname.includes(id));
  if (currentPage) {
    const sidebarElement = document.getElementById(`${currentPage}Bar`);
    sidebarElement.classList.add("active-page");
  }
}

/**
 * Updates the favicon based on the user's preferred color scheme.
 * Uses one favicon for dark mode and another for light mode.
 */
function updateFaviconForTheme() {
  const favicon = document.getElementById("favicon");
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  favicon.href = isDark
    ? '../assets/icons/logo/joinLogo.svg'
    : '../assets/icons/logo/whiteJoinLogo.svg';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFaviconForTheme);

/**
 * Detects whether the current browser is Firefox.
 * This is used to apply a scrollbar-related workaround for Firefox.
 * @type {boolean}
 */
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

if (isFirefox) {
  document.body.classList.remove('scrollable');
  document.querySelector('.app-container')?.classList.add('scrollable');
}

/**
 * Checks whether an active Join session exists.
 * A session is considered active if header initials are stored in sessionStorage.
 * @returns {boolean} True if a session exists, otherwise false.
 */
function hasActiveJoinSession() {
  return !!sessionStorage.getItem("headerInitials");
}

/**
 * Checks whether the current page is protected and requires an active session.
 * @returns {boolean} True if the current page is protected, otherwise false.
 */
function isProtectedJoinPage() {
  const protectedPages = [
    "/summary.html",
    "/add-task.html",
    "/board-site.html",
    "/contacts.html"
  ];
  return protectedPages.some((page) => window.location.pathname.endsWith(page));
}

/**
 * Blocks access to protected pages when no active Join session exists.
 * Redirects the user to the login view if access is not allowed.
 */
function enforceProtectedPageAccess() {
  if (isProtectedJoinPage() && !hasActiveJoinSession()) {
    window.location.replace("../index.html?view=login");
  }
}

/**
 * Re-checks protected page access when the page is shown again,
 * for example after browser back/forward navigation or restoring from cache.
 */
window.addEventListener("pageshow", () => {
  enforceProtectedPageAccess();
});