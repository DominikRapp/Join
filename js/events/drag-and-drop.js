import { updateTaskColumnData } from "../ui/render-board.js";

let currentDraggedElement = null;

/** * Initializes the drag-and-drop functionality for task cards.
 * Adds event listeners for drag start, drag end, drag over, drag leave, and drop events.
 */
export function initDragAndDrop() {
  const taskCards = document.querySelectorAll(".task-card");
  taskCards.forEach((taskCard) => {
    taskCard.setAttribute("draggable", "true");
    taskCard.addEventListener("dragstart", dragStart);
    taskCard.addEventListener("dragend", dragEnd);
  });
  const taskColumns = document.querySelectorAll(".task-column");
  taskColumns.forEach((column) => {
    column.addEventListener("dragover", allowDrop);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);
  });
}

/**
 * Maps a client-side column ID to the corresponding Firebase column ID.
 * @param {string} clientColumnId - The column ID used in the DOM.
 * @returns {string} The matching Firebase column ID or the original ID if no mapping exists.
 */
function mapClientToFirebaseColumnId(clientColumnId) {
  const firebaseColumnMapping = {
    triage: "triage",
    "to-do": "toDo",
    "in-progress": "inProgress",
    "await-feedback": "review",
    done: "done",
  };
  return firebaseColumnMapping[clientColumnId] || clientColumnId;
}

/** * Handles the drag start event.
 * Sets the current dragged element and adds a class for styling.
 * @param {DragEvent} event
 */
function dragStart(event) {
  currentDraggedElement = event.target;
  event.dataTransfer.setData("text/plain", currentDraggedElement.id);
  setTimeout(() => {
    if (currentDraggedElement && currentDraggedElement.classList) {
      currentDraggedElement.classList.add("is-dragging");
    }
  }, 0);
}

/** * Handles the drag end event.
 * Removes the dragging class and resets the current dragged element.
 * @param {DragEvent} event
 */
/**
 * Handles the drag end event.
 * Removes the dragging class and resets the current dragged element.
 * @param {DragEvent} event
 */
function dragEnd(event) {
  removeDraggingClass(event.target);
  currentDraggedElement = null;
  removeDragOverFromColumns();
}

/**
 * Removes the dragging class from the target element.
 * @param {HTMLElement} target - The dragged element.
 */
function removeDraggingClass(target) {
  if (target && target.classList) {
    target.classList.remove("is-dragging");
  }
}

/**
 * Removes the drag-over class from all columns.
 */
function removeDragOverFromColumns() {
  document.querySelectorAll(".task-column").forEach((column) => {
    if (column && column.classList) {
      column.classList.remove("drag-over");
    }
  });
}

/** * Allows dropping on the target element.
 * Prevents the default behavior and adds a class for styling.
 * @param {DragEvent} event
 */
function allowDrop(event) {
  event.preventDefault();
  if (
    event.target.classList.contains("task-column") &&
    !event.target.classList.contains("drag-over")
  ) {
    event.target.classList.add("drag-over");
  }
}

/** * Handles the drag leave event.
 * Removes the drag-over class from the target element.
 * @param {DragEvent} event
 */
function dragLeave(event) {
  if (event.target.classList.contains("task-column")) {
    event.target.classList.remove("drag-over");
  }
}

/**
 * Handles the drop event.
 * Moves the dragged element to the new column and updates the task data.
 * @param {DragEvent} event
 */
async function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const draggedElement = document.getElementById(taskId);
  const targetColumn = event.target.closest(".task-column");
  await handleDropMove(draggedElement, targetColumn, taskId);
  removeDragOverClass(targetColumn);
}

/**
 * Moves the dragged task card to a different column and updates the task state.
 * @param {HTMLElement} draggedElement - The dragged task card element.
 * @param {HTMLElement} targetColumn - The target column element.
 * @param {string} taskId - The ID of the dragged task.
 */
async function handleDropMove(draggedElement, targetColumn, taskId) {
  if (draggedElement && targetColumn) {
    const newColumnId = targetColumn.id;
    const oldColumnId = draggedElement.closest(".task-column").id;
    if (newColumnId !== oldColumnId) {
      targetColumn.appendChild(draggedElement);
      if (allData && allData.tasks && allData.tasks[taskId]) {
        await updateTaskColumnData(taskId, newColumnId);
      }
    }
  }
}

/**
 * Removes the drag-over class from the target column.
 * @param {HTMLElement} targetColumn - The target column element.
 */
function removeDragOverClass(targetColumn) {
  if (targetColumn) {
    targetColumn.classList.remove("drag-over");
  }
}
