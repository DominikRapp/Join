/**
 * Refreshes the board by loading and rendering the latest task data.
 * @returns {Promise<void>} Resolves when the board has been refreshed.
 */
export async function refreshBoardSite() {
  await loadAndRenderBoard();
}

import { loadFirebaseData } from "../../main.js";
import { initDragAndDrop } from "../events/drag-and-drop.js";
import { createSimpleTaskCard } from "./render-card.js";
import { allData } from "../data/task-to-firbase.js";
import { toggleCheckbox } from "../ui/toggle-checkbox.js";

window.toggleCheckbox = toggleCheckbox;

let tasksData = {};

/**
 * Checks whether the board data contains the required task and contact collections.
 * @param {object} boardData - The board data object to validate.
 * @returns {boolean} True if the required data exists, otherwise false.
 */
function validateRenderBoardData(boardData) {
  if (!boardData || !boardData.tasks || !boardData.contacts) {
    return false;
  }
  return true;
}

/**
 * All supported board column IDs used in the UI.
 * @type {string[]}
 */
const VALID_COLUMNS = ["triage", "to-do", "in-progress", "await-feedback", "done"];

/**
 * Maps Firebase column IDs to the column IDs used in the board UI.
 * @type {Object<string, string>}
 */
const COLUMN_MAPPING = {
  triage: "triage",
  toDo: "to-do",
  inProgress: "in-progress",
  review: "await-feedback",
  done: "done",
};

/**
 * Creates an empty task collection for each valid board column.
 * @returns {object} Object with all valid columns initialized as empty arrays.
 */
function initializeTasksByColumn() {
  const tasksByColumn = {};
  VALID_COLUMNS.forEach((col) => {
    tasksByColumn[col] = [];
  });
  return tasksByColumn;
}

/**
 * Adds a task to the correct grouped column list if its column mapping is valid.
 * The task is stored together with its creation date so it can be sorted later.
 * @param {string} taskID - The ID of the task.
 * @param {object} task - The task object.
 * @param {object} tasksByColumn - The grouped task structure.
 */
function processTaskForColumn(taskID, task, tasksByColumn) {
  const colID = task.columnID;
  const mappedColID = COLUMN_MAPPING[colID];
  if (!mappedColID || !VALID_COLUMNS.includes(mappedColID)) return;
  const createdAtDate = Array.isArray(task.createdAt)
    ? new Date(task.createdAt[0])
    : new Date(task.createdAt);
  tasksByColumn[mappedColID].push({ taskID, createdAt: createdAtDate });
}

/**
 * Groups all tasks into their matching UI columns.
 * @param {object} tasks - The full task object collection.
 * @returns {object} Grouped task object by board column.
 */
function groupTasksByColumn(tasks) {
  const tasksByColumn = initializeTasksByColumn();
  Object.entries(tasks).forEach(([taskID, task]) => {
    if (task && typeof task.columnID !== "undefined") {
      processTaskForColumn(taskID, task, tasksByColumn);
    }
  });
  return tasksByColumn;
}

/**
 * Sorts each grouped column by task creation date in ascending order.
 * @param {object} tasksByColumn - The grouped tasks object.
 */
function sortGroupedTasks(tasksByColumn) {
  VALID_COLUMNS.forEach((colID) => {
    tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
  });
}

/**
 * Removes existing rendered task cards from a column container.
 * The empty-state placeholder stays untouched.
 * @param {string} colID - The UI column ID.
 * @returns {HTMLElement|null} The cleaned column container or null if not found.
 */
function clearAndPrepareColumnContainer(colID) {
  const container = document.getElementById(colID);
  if (!container) return null;
  container.querySelectorAll(".task-card").forEach((card) => card.remove());
  return container;
}

/**
 * Returns the existing placeholder element of a column or creates one if missing.
 * @param {HTMLElement} container - The column container element.
 * @returns {HTMLElement} The placeholder element.
 */
function getOrCreatePlaceholder(container) {
  let placeholder = container.querySelector(".no-tasks-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "no-tasks-placeholder";
    placeholder.textContent = getPlaceholderText(container.id);
    container.appendChild(placeholder);
  }
  return placeholder;
}

/**
 * Returns the matching placeholder text for a board column.
 * @param {string} columnId - The UI column ID.
 * @returns {string} The placeholder text for the given column.
 */
function getPlaceholderText(columnId) {
  const placeholderTexts = {
    triage: "No tasks in triage",
    "to-do": "No tasks to do",
    "in-progress": "No tasks in progress",
    "await-feedback": "No tasks in review",
    done: "No tasks done",
  };
  return placeholderTexts[columnId] || "No tasks available";
}

/**
 * Renders all tasks for one column and toggles the placeholder visibility.
 * @param {HTMLElement} container - The column container element.
 * @param {Array} tasksInColumn - The grouped tasks for this column.
 * @param {object} boardData - The full board data object.
 */
function renderColumnTasks(container, tasksInColumn, boardData) {
  const placeholder = getOrCreatePlaceholder(container);
  if (tasksInColumn.length > 0) {
    placeholder.style.display = "none";
    tasksInColumn.forEach(({ taskID }) => {
      container.insertAdjacentHTML(
        "beforeend",
        createSimpleTaskCard(boardData, taskID)
      );
    });
  } else {
    placeholder.style.display = "block";
  }
}

/**
 * Renders all tasks into their matching columns and initializes board interactions.
 * @param {object} boardData - The board data containing tasks and contacts.
 */
export function renderTasksByColumn(boardData) {
  if (!validateRenderBoardData(boardData)) return;
  tasksData = boardData.tasks;
  window.allData = boardData;
  const groupedTasks = groupAndSortTasks(tasksData);
  renderAllColumns(groupedTasks, boardData);
  setupTaskCardOverlays(boardData);
  initDragAndDrop();
}

/**
 * Groups tasks by column and sorts them by creation date.
 * @param {object} tasks - The task collection.
 * @returns {object} The grouped and sorted task structure.
 */
function groupAndSortTasks(tasks) {
  const grouped = groupTasksByColumn(tasks);
  sortGroupedTasks(grouped);
  return grouped;
}

/**
 * Renders every board column with its assigned tasks.
 * @param {object} groupedTasks - Tasks grouped by UI column.
 * @param {object} boardData - The full board data object.
 */
function renderAllColumns(groupedTasks, boardData) {
  VALID_COLUMNS.forEach((colID) => {
    const container = clearAndPrepareColumnContainer(colID);
    if (container) {
      renderColumnTasks(container, groupedTasks[colID], boardData);
    }
  });
}

/**
 * Registers the task detail overlay after the task cards have been rendered.
 * Loads the required modules lazily.
 * @param {object} boardData - The full board data object.
 */
function setupTaskCardOverlays(boardData) {
  import("../ui/render-card.js").then((module) => {
    import("../templates/task-details-template.js").then((templateModule) => {
      if (typeof module.registerTaskCardDetailOverlay === "function") {
        module.registerTaskCardDetailOverlay(
          boardData,
          templateModule.getTaskOverlay
        );
      }
    });
  });
}

/**
 * Maps a UI column ID back to the Firebase column ID format.
 * @param {string} clientColumnId - The board UI column ID.
 * @returns {string} The matching Firebase column ID.
 */
function mapClientToFirebaseColumnId(clientColumnId) {
  const firebaseColumnMapping = {
    triage: "triage",
    "to-do": "toDo",
    "in-progress": "inProgress",
    "await-feedback": "review",
    done: "done",
  };
  return firebaseColumnMapping[clientColumnId];
}

/**
 * Updates the task column locally so the current state stays in sync in memory.
 * @param {string} taskId - The ID of the task.
 * @param {string} firebaseColumnId - The new Firebase column ID.
 */
function updateLocalTaskColumn(taskId, firebaseColumnId) {
  if (tasksData[taskId]) {
    tasksData[taskId].columnID = firebaseColumnId;
  }
}

/**
 * Updates the task's column in Firebase after a drag-and-drop column change.
 * If the task does not exist locally, the update is skipped.
 * After a successful Firebase update, the local task cache is updated as well.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} firebaseColumnId - The new column ID to store in Firebase.
 * @returns {Promise<void>} Resolves when the Firebase update attempt is complete.
 */
async function triggerFirebaseUpdate(taskId, firebaseColumnId) {
  const task = tasksData[taskId];
  if (!task) return;
  const updatedTask = { ...task, columnID: firebaseColumnId, updatedAt: new Date().toLocaleDateString("de-DE"), };
  try {
    const response = await fetch(
      buildFirebaseUrl(`tasks/${taskId}`),
      { method: "PUT", headers: { "Content-Type": "application/json", }, body: JSON.stringify(updatedTask), }
    );
    if (!response.ok) {
      throw new Error(`Firebase update failed: ${response.status}`);
    }
    tasksData[taskId] = updatedTask;
  } catch (error) {
    console.error("Task column update failed:", error);
  }
}

/**
 * Creates a new status notification entry in Firebase when an external task
 * is moved to a different column.
 * Notifications are only created for tasks with an external creator email
 * and only when the column actually changes.
 * @param {string} taskId - The ID of the moved task.
 * @param {string} previousColumnId - The previous column ID before the move.
 * @param {string} newColumnId - The new column ID after the move.
 * @returns {Promise<void>} Resolves when the notification creation attempt is complete.
 */
async function createStatusNotification(taskId, previousColumnId, newColumnId) {
  const task = tasksData[taskId];
  if (!task) return;
  if (task.creatorType !== "extern" || !task.creatorEmail) return;
  if (previousColumnId === newColumnId) return;
  const notificationId = `notification-${Date.now()}-${taskId}`;
  const notificationData = { taskId, taskTitle: task.title || "Task", creatorName: task.creatorName || "", creatorEmail: task.creatorEmail, creatorType: task.creatorType, creatorSource: task.creatorSource || "", previousColumnId, newColumnId, createdAt: new Date().toISOString(), processed: false, };
  try {
    const response = await fetch(
      buildFirebaseUrl(`statusNotifications/${notificationId}`),
      { method: "PUT", headers: { "Content-Type": "application/json", }, body: JSON.stringify(notificationData), }
    );
    if (!response.ok) { throw new Error(`Status notification failed: ${response.status}`); }
  } catch (error) { console.error("Creating status notification failed:", error); }
}

/**
 * Updates the column of a task locally, triggers the external update,
 * and reloads the board afterwards.
 * @param {string} taskId - The ID of the task.
 * @param {string} newColumnId - The new UI column ID.
 * @returns {Promise<void>} Resolves when the update flow is complete.
 */
export async function updateTaskColumnData(taskId, newColumnId) {
  if (!tasksData[taskId]) return;
  const previousColumnId = tasksData[taskId].columnID;
  const firebaseColumnId = mapClientToFirebaseColumnId(newColumnId);
  if (!firebaseColumnId) return;
  await createStatusNotification(taskId, previousColumnId, firebaseColumnId);
  updateLocalTaskColumn(taskId, firebaseColumnId);
  await triggerFirebaseUpdate(taskId, firebaseColumnId);
  await initializeBoard();
}

/**
 * Loads the latest board data from Firebase and renders it.
 * @returns {Promise<void>} Resolves when loading and rendering are complete.
 */
export async function loadAndRenderBoard() {
  const firebaseBoardData = await loadFirebaseData();
  if (firebaseBoardData) {
    renderTasksByColumn(firebaseBoardData);
  }
}

/**
 * Initializes the board on page load.
 * @returns {Promise<void>} Resolves when the board has been initialized.
 */
async function initializeBoard() {
  await loadAndRenderBoard();
}

/**
 * Initializes the board after the DOM has finished loading.
 */
document.addEventListener("DOMContentLoaded", initializeBoard);