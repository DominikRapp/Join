import { selectedContacts } from "../events/dropdown-menu.js";

/**
 * Extracts task data from the edit form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @param {object} taskToEdit - The original task object.
 * @returns {object} The extracted task data.
 */

/**
 * Extracts the title from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted title.
 */
function extractTitle(form) {
  return form.querySelector("[name='title']")?.value || "";
}

/**
 * Extracts the description from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted description.
 */
function extractDescription(form) {
  return form.querySelector("[name='task-description']")?.value || "";
}

/**
 * Extracts the deadline from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted deadline.
 */
function extractDeadline(form) {
  return form.querySelector("[name='datepicker']")?.value || "";
}

/**
 * Extracts the type/category from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted type/category.
 */
function extractType(form) {
  const selectedCategoryElem = form.querySelector("#selected-category");
  return selectedCategoryElem ? selectedCategoryElem.textContent.trim() : "";
}

/**
 * Extracts the priority from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted priority.
 */
function extractPriority(form) {
  const activePrioBtn = form.querySelector(".priority-btn.active");
  return activePrioBtn ? activePrioBtn.getAttribute("data-priority") : "";
}

/**
 * Extracts assigned user IDs from the form using the contacts object.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @returns {string[]} Array of assigned user IDs.
 */
function extractAssignedUsers(form, contactsObj) {
  if (!Array.isArray(selectedContacts) || !contactsObj) {
    return [];
  }
  return selectedContacts
    .map((contact) => {
      if (contact.id && contactsObj[contact.id]) {
        return contact.id;
      }
      const cleanName = (contact.name || "").replace(/\s*\(You\)\s*$/, "").trim();
      return (
        Object.entries(contactsObj).find(([cid, storedContact]) => storedContact.name === cleanName)?.[0] || null
      );
    })
    .filter(Boolean);
}

/**
 * Extracts subtasks and their checked status from the form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} taskToEdit - The original task object (for fallback values).
 * @returns {{ totalSubtasks: string[], checkedSubtasks: boolean[] }} Subtasks and their checked status.
 */
/**
 * Gets subtasks from input fields in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromInputs(form) {
  return Array.from(form.querySelectorAll(".subtask-input"))
    .map((input) => input.value.trim())
    .filter((text) => text !== "");
}

/**
 * Gets subtasks from text nodes in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromTextNodes(form) {
  return Array.from(form.querySelectorAll(".subtask-text"))
    .map((node) => node.textContent.trim())
    .filter((text) => text !== "");
}

/**
 * Gets subtasks from item nodes in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromItems(form) {
  return Array.from(form.querySelectorAll(".subtask-item"))
    .map((node) => node.textContent.trim())
    .filter((text) => text !== "");
}

/**
 * Extracts the current subtask data from the edit form.
 * Tries multiple DOM-based fallback strategies to collect subtask titles,
 * and restores the existing task subtask data if no form-based subtasks are found.
 * @param {HTMLFormElement} form - The edit form containing the subtask elements.
 * @param {object} taskToEdit - The existing task object used as a fallback source.
 * @returns {{totalSubtasks: string[], checkedSubtasks: boolean[]}} The extracted subtask titles and their completion states.
 */
function extractSubtasks(form, taskToEdit) {
  let totalSubtasks = getSubtasksFromInputs(form);
  let checkedSubtasks = Array.from(form.querySelectorAll(".subtask-text")).map(
    (node) => node.classList.contains("completed")
  );
  if (totalSubtasks.length === 0) {
    totalSubtasks = getSubtasksFromTextNodes(form);
    if (totalSubtasks.length === 0) totalSubtasks = getSubtasksFromItems(form);
    if (totalSubtasks.length === 0) {
      totalSubtasks = Array.isArray(taskToEdit.totalSubtasks) ? [...taskToEdit.totalSubtasks] : [];
      checkedSubtasks = Array.isArray(taskToEdit.checkedSubtasks) ? [...taskToEdit.checkedSubtasks] : [];
    }
  }
  return { totalSubtasks, checkedSubtasks };
}

/**
 * Extracts all relevant task data from the form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @param {object} taskToEdit - The original task object.
 * @returns {object} The extracted task data.
 */
export function extractTaskFormData(form, contactsObj, taskToEdit) {
  const rawTitle = extractTitle(form).trim();
  const rawDescription = extractDescription(form).trim();
  const rawDeadline = extractDeadline(form).trim();
  const rawType = extractType(form).trim();
  const rawPriority = extractPriority(form).trim();
  const rawAssignedUsers = extractAssignedUsers(form, contactsObj);
  const title = rawTitle || taskToEdit.title || "";
  const description = rawDescription || taskToEdit.description || "";
  const deadline = rawDeadline || taskToEdit.deadline || "";
  const type = rawType && rawType !== "Select task category" ? rawType : taskToEdit.type || "";
  const priority = rawPriority || taskToEdit.priority || "medium";
  const assignedUsers = Array.isArray(rawAssignedUsers) && rawAssignedUsers.length > 0 ? rawAssignedUsers : Array.isArray(taskToEdit.assignedUsers) ? [...taskToEdit.assignedUsers] : [];
  const { totalSubtasks, checkedSubtasks } = extractSubtasks(form, taskToEdit);
  return { title, description, deadline, type, priority, assignedUsers, totalSubtasks, checkedSubtasks, };
}
