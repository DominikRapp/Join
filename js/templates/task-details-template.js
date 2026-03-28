import { CWDATA, allData } from "../data/task-to-firbase.js";
import { firebaseData } from "../../main.js";
import {
  getTaskHeader,
  getTaskDescription,
  getTaskDueDate,
  getTaskPriority,
  getTaskCreatorSection,
  getTaskSubtasksSection,
  getCardMenu,
} from "./task-details-sections.js";

/**
 * Handles clicks on delete buttons and removes the matching task from Firebase.
 */
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".delete-task-btn");
  if (btn) {
    const taskId = btn.getAttribute("data-task-id");
    CWDATA({ [taskId]: null }, allData);
  }
});

/**
 * Formats a date from "DD.MM.YYYY" to "DD/MM/YYYY".
 * @param {string} dateString - The date string in format "DD.MM.YYYY".
 * @returns {string} The formatted date string in format "DD/MM/YYYY".
 */
function getFormattedDate(dateString) {
  const parts = dateString.split(".");
  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return date
    .toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\./g, "/");
}

/**
 * Checks whether a date string in format "DD.MM.YYYY" is valid.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} True if the date is valid, otherwise false.
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const parts = dateString.split(".");
  if (parts.length !== 3) return false;
  const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return !isNaN(new Date(isoDate).getTime());
}

/**
 * Formats a deadline string if it is valid.
 * @param {string} deadline - The deadline string in format "DD.MM.YYYY".
 * @returns {string} The formatted deadline or an empty string if invalid.
 */
function formatDeadline(deadline) {
  return isValidDate(deadline) ? getFormattedDate(deadline) : "";
}

/**
 * Returns creator metadata from the task object with fallback defaults.
 * @param {object} task - The task object.
 * @returns {{creatorType: string, creatorName: string, creatorSource: string, isAIGenerated: boolean}} The creator metadata.
 */
export function getTaskCreatorMeta(task) {
  return {
    creatorType: task.creatorType ?? "extern",
    creatorName: task.creatorName ?? "Guest",
    creatorSource: task.creatorSource ?? "manual",
    isAIGenerated: task.isAIGenerated ?? false,
  };
}

/**
 * Checks whether a contact matches the given details.
 * @param {object} contact - The contact object.
 * @param {string} name - The contact name.
 * @param {string} initials - The contact initials.
 * @param {string} avatarColor - The contact avatar color.
 * @returns {boolean} True if the contact matches, otherwise false.
 */
function contactMatches(contact, name, initials, avatarColor) {
  return (
    contact.name === name &&
    contact.initials === initials &&
    contact.avatarColor === avatarColor
  );
}

/**
 * Checks whether a contact is included in the assigned contacts list.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 * @param {Array<object>} assignedContacts - The assigned contact objects.
 * @returns {boolean} True if the contact is already assigned, otherwise false.
 */
function isContactSelected(name, initials, avatarColor, assignedContacts) {
  return (
    assignedContacts?.some((c) =>
      contactMatches(c, name, initials, avatarColor)
    ) ?? false
  );
}

/**
 * Renders a contact option with its selected state.
 * @param {object} contact - The contact object to render.
 * @param {Array<object>} assignedContactObjects - The assigned contact objects used for comparison.
 * @returns {string} The HTML string for the contact option.
 */
export function renderAssignedToContactsWithSelection(
  contact,
  assignedContactObjects
) {
  const { name, initials, avatarColor } = contact;
  const isSelected = isContactSelected(
    name,
    initials,
    avatarColor,
    assignedContactObjects
  );
  const assignedClass = isSelected ? "assigned" : "";
  return `
    <div class="contact-option ${assignedClass}" data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
      <div class="contact-checkbox">
        <div class="initials-container">
          <div class="assigned-initials-circle" style="background-color: var(${avatarColor});">${initials}</div>
          <div>${name}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Filters and returns contact objects for the given assigned user IDs.
 * @param {Array<string>} assignedUserIDs - The assigned user IDs.
 * @param {object} allContactsObject - All contacts stored by ID.
 * @returns {Array<object>} The matching contact objects.
 */
function getFilteredContacts(assignedUserIDs, allContactsObject) {
  if (!assignedUserIDs) return [];
  return assignedUserIDs.map((id) => allContactsObject[id]).filter(Boolean);
}

/**
 * Generates the HTML string for all assigned contacts of a task.
 * @param {Array<string>} assignedUserIDs - The assigned user IDs of the task.
 * @param {object} allContactsObject - All contacts stored by ID.
 * @returns {string} The HTML string for the assigned contacts.
 */
function getAssignedContactsHtml(assignedUserIDs, allContactsObject) {
  const assignedContacts = getFilteredContacts(
    assignedUserIDs,
    allContactsObject
  );
  return assignedContacts
    .map((contact) =>
      renderAssignedToContactsWithSelection(contact, assignedContacts)
    )
    .join("");
}

/**
 * Creates the HTML section for the assigned contacts of a task.
 * @param {object} task - The task object.
 * @param {object} allContactsObject - All contacts stored by ID.
 * @returns {string} The HTML string for the assignment section.
 */
function getTaskAssignmentSection(task, allContactsObject) {
  const contactsHtml = getAssignedContactsHtml(
    task.assignedUsers,
    allContactsObject
  );
  return `
    <div class="taskCardField assigned-section">
      <p class="assigned-title">Assigned To:</p>
      <div class="entryList assigned-list">${contactsHtml}</div>
    </div>
  `;
}

/**
 * Creates the complete HTML overlay for a task.
 * @param {object} task - The task object to display.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The complete HTML string for the task overlay.
 */
export function getTaskOverlay(task, taskId) {
  if (!firebaseData?.contacts) return `<div class="task-overlay-error"></div>`;
  if (!task) return `<div class="task-overlay-error">Task data missing</div>`;
  const contactsObject = firebaseData.contacts;
  const formattedDeadline = formatDeadline(task.deadline ?? "");
  return `
    <main class="content-task">
      ${getTaskHeader(task, taskId, getTaskCreatorMeta)}
      ${getTaskDescription(task)}
      ${getTaskCreatorSection(task, getTaskCreatorMeta)}
      ${getTaskDueDate(formattedDeadline)}
      ${getTaskPriority(task)}
      ${getTaskAssignmentSection(task, contactsObject)}
      ${getTaskSubtasksSection(task)}
      ${getCardMenu(taskId)}
    </main>
  `;
}