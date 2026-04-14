// Handler für Cancel/Edit/Submit im Edit-Formular
import { extractTaskFormData } from "../utils/form-utils.js";
import { getFormattedDate } from "../utils/date-utils.js";
import { CWDATA } from "../data/task-to-firbase.js";
import { closeSpecificOverlay } from "../events/overlay-handler.js";
import { renderDetailOverlay } from "./render-card-events.js";
/**
 * Sets up the cancel button for the edit form overlay.
 * @param {HTMLElement} container - The container element for the edit form.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function setupCancelEditBtn(
  container,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const cancelEditBtn = container.querySelector(".cancel-btn");
  if (cancelEditBtn) {
    cancelEditBtn.onclick = () => {
      closeSpecificOverlay("overlay-task-detail-edit");
      renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
    };
  }
}

/**
 * Sets up the submit listener for the edit form.
 * @param {HTMLElement} container - The container element for the edit form.
 * @param {object} taskToEdit - The task object being edited.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function setupTaskEditFormListener(
  container,
  taskToEdit,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const taskEditForm = container.querySelector("#add-task-form");
  if (taskEditForm) {
    taskEditForm.addEventListener("submit", (formEvent) =>
      handleTaskEditFormSubmit(formEvent, taskEditForm, taskToEdit, taskToEditId, boardData, updateBoardFunction)
    );
  }
}

/**
 * Handles the submit event for the edit form.
 * @param {Event} formEvent - The submit event.
 * @param {HTMLFormElement} taskEditForm - The edit form element.
 * @param {object} taskToEdit - The task object being edited.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {Promise<void>} Resolves when the form is processed.
 */
export async function handleTaskEditFormSubmit(formEvent, taskEditForm, taskToEdit, taskToEditId, boardData, updateBoardFunction) {
  if (!isSubmitEvent(formEvent)) return;
  formEvent.preventDefault();
  const fetchData = window.firebaseData || boardData;
  const contactsObj = fetchData && fetchData.contacts ? fetchData.contacts : {};
  const formData = extractTaskFormData(taskEditForm, contactsObj, taskToEdit);
  const editTaskObjekt = buildEditTaskObject(formData, taskToEdit);
  const currentTaskId =
    taskEditForm.getAttribute("data-task-id") || taskToEditId;
  await CWDATA({ [currentTaskId]: editTaskObjekt }, fetchData);
  closeSpecificOverlay("overlay-task-detail-edit");
  if (updateBoardFunction) await updateBoardFunction();
  renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
}

/**
 * Checks whether the triggered form event was caused by a valid submit button.
 * Prevents the default event behavior and returns false if no submitter exists
 * or if the submitter is not of type "submit".
 * @param {SubmitEvent} formEvent - The form submit event to validate.
 * @returns {boolean} True if the event was triggered by a valid submit button, otherwise false.
 */
function isSubmitEvent(formEvent) {
  const submitter = formEvent.submitter;
  if (!submitter || submitter.type !== "submit") {
    formEvent.preventDefault();
    return false;
  }
  return true;
}

/**
 * Builds the updated task object for edit mode by merging the submitted form data
 * with the existing task data and preserving fallback values where needed.
 * Also recalculates the completed subtask count and updates the timestamp.
 * @param {object} formData - The normalized form data submitted by the user.
 * @param {object} taskToEdit - The existing task object that is being edited.
 * @returns {object} The merged task object with updated values.
 */
function buildEditTaskObject(formData, taskToEdit) {
  const checkedSubtasks = Array.isArray(formData.checkedSubtasks) ? formData.checkedSubtasks : Array.isArray(taskToEdit.checkedSubtasks) ? [...taskToEdit.checkedSubtasks] : [];
  const totalSubtasks = Array.isArray(formData.totalSubtasks) ? formData.totalSubtasks : Array.isArray(taskToEdit.totalSubtasks) ? [...taskToEdit.totalSubtasks] : [];
  const subtasksCompleted = checkedSubtasks.filter(Boolean).length;
  const updatedAt = getFormattedDate();
  return {
    ...taskToEdit,
    assignedUsers: Array.isArray(formData.assignedUsers) && formData.assignedUsers.length > 0 ? formData.assignedUsers : Array.isArray(taskToEdit.assignedUsers) ? [...taskToEdit.assignedUsers] : [],
    boardID: taskToEdit.boardID || "board-1",
    checkedSubtasks,
    columnID: taskToEdit.columnID || "triage",
    createdAt: taskToEdit.createdAt || updatedAt,
    deadline: formData.deadline || taskToEdit.deadline || "",
    description: formData.description || taskToEdit.description || "",
    priority: formData.priority || taskToEdit.priority || "medium",
    subtasksCompleted,
    title: formData.title || taskToEdit.title || "",
    totalSubtasks,
    type: formData.type || taskToEdit.type || "",
    updatedAt,
  };
}
