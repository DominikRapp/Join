let taskData;

let summaryData = {
  numberOfTasks: 0,
  toDo: 0,
  urgent: 0,
  deadline: "No upcoming deadline",
  inProgress: 0,
  review: 0,
  done: 0,
  emailRequests: 0
};

const VALID_SUMMARY_COLUMNS = ["triage", "toDo", "inProgress", "review", "done"];

/**
 * Normalizes outdated or incorrect column IDs to the Firebase column format.
 * This keeps the summary and board data consistent.
 * @param {string} columnID - The original column ID of a task.
 * @returns {string|null} The normalized column ID or null if it is invalid.
 */
function normalizeColumnID(columnID) {
  const columnMap = {
    triage: "triage",
    "to-do": "toDo",
    toDo: "toDo",
    "in-progress": "inProgress",
    inProgress: "inProgress",
    "await-feedback": "review",
    review: "review",
    done: "done",
  };
  return columnMap[columnID] || null;
}

/**
 * Returns only tasks that count as valid board tasks for the summary.
 * @returns {Array<[string, object]>} An array of valid task entries.
 */
function getValidTaskEntries() {
  return Object.entries(taskData).filter(([_, task]) => {
    if (!task || typeof task !== "object") return false;
    const normalizedColumnID = normalizeColumnID(task.columnID);
    return VALID_SUMMARY_COLUMNS.includes(normalizedColumnID);
  });
}

/**
 * Initializes the summary page by loading task data,
 * calculating all summary values, and updating the UI.
 */
async function initSummary() {
  const data = await getFirebaseData("tasks");
  if (!data) {
    console.error("No data received");
    return;
  }
  taskData = data;
  summarizeTasks();
  countEmailRequests();
  deadline();
  fillSummary();
  setGreeting();
  displayUser();
}

/**
 * Counts how many valid tasks were created from email requests.
 */
function countEmailRequests() {
  const validTasks = getValidTaskEntries();
  summaryData.emailRequests = validTasks.filter(([_, task]) => {
    return task.creatorSource === "email";
  }).length;
}

/**
 * Counts all valid board tasks and updates the summary totals.
 */
function summarizeTasks() {
  const validTasks = getValidTaskEntries();
  summaryData.numberOfTasks = validTasks.length;
  getColumnIdData(validTasks);
}

/**
 * Counts task statuses by normalized column ID and urgent priority.
 * @param {Array<[string, object]>} taskEntries - The valid task entries.
 */
function getColumnIdData(taskEntries) {
  taskEntries.forEach(([_, task]) => {
    const normalizedColumnID = normalizeColumnID(task.columnID);
    const { priority } = task;
    if (priority === "urgent") {
      summaryData.urgent++;
    }
    if (summaryData.hasOwnProperty(normalizedColumnID)) {
      summaryData[normalizedColumnID]++;
    }
  });
}

/**
 * Determines the nearest upcoming deadline from all unfinished valid tasks.
 */
function deadline() {
  const dateStrings = getDatesAndFilter();
  const parsedDates = parseDates(dateStrings);
  const deadlines = filterFutureDeadlines(parsedDates);
  summaryData.deadline = findUpcomingDeadline(deadlines);
}

/**
 * Returns deadline strings from all valid tasks that are not done yet.
 * @returns {string[]} An array of deadline strings.
 */
function getDatesAndFilter() {
  const validTasks = getValidTaskEntries();
  return validTasks
    .filter(([_, task]) => normalizeColumnID(task.columnID) !== "done")
    .map(([_, task]) => task.deadline)
    .filter(Boolean);
}

/**
 * Converts valid deadline strings into Date objects.
 * @param {string[]} dateStringArray - An array of deadline strings.
 * @returns {Date[]} An array of parsed Date objects.
 */
function parseDates(dateStringArray) {
  return dateStringArray
    .filter(dateStr => typeof dateStr === "string" && dateStr.includes("."))
    .map(dateStr => {
      const [day, month, year] = dateStr.split(".").map(Number);
      return new Date(year, month - 1, day);
    });
}

/**
 * Filters all parsed deadlines and keeps only today or future dates.
 * @param {Date[]} parsedDates - An array of parsed Date objects.
 * @returns {Date[]} An array of upcoming deadlines.
 */
function filterFutureDeadlines(parsedDates) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsedDates.filter(date => date >= today);
}

/**
 * Returns the nearest upcoming deadline or a fallback text if none exist.
 * @param {Date[]} futureDeadlines - An array of upcoming deadline dates.
 * @returns {string} The nearest deadline as a formatted string.
 */
function findUpcomingDeadline(futureDeadlines) {
  if (futureDeadlines.length === 0) {
    return "No upcoming deadline";
  } else {
    return getDeadline(futureDeadlines);
  }
}

/**
 * Finds the earliest date from all upcoming deadlines.
 * @param {Date[]} futureDeadlines - An array of upcoming deadline dates.
 * @returns {string} The nearest deadline as a formatted string.
 */
function getDeadline(futureDeadlines) {
  let nearest = futureDeadlines[0];
  for (let i = 1; i < futureDeadlines.length; i++) {
    const current = futureDeadlines[i];
    if (current < nearest) {
      nearest = current;
    }
  }
  return convertToDisplayString(nearest);
}

/**
 * Converts a Date object into a readable display string.
 * @param {Date} nearest - The nearest deadline date.
 * @returns {string} The formatted deadline string.
 */
function convertToDisplayString(nearest) {
  return nearest.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Writes all calculated summary values into the summary page.
 */
function fillSummary() {
  document.getElementById("to-do").innerText = summaryData.toDo;
  document.getElementById("done").innerText = summaryData.done;
  document.getElementById("urgent").innerText = summaryData.urgent;
  document.getElementById("tasks-in-board").innerText = summaryData.numberOfTasks;
  document.getElementById("tasks-in-progress").innerText = summaryData.inProgress;
  document.getElementById("await-feedback").innerText = summaryData.review;
  document.getElementById("email-requests").innerText = summaryData.emailRequests;
  document.getElementById("deadline").innerText = summaryData.deadline;
}

/**
 * Sets the greeting text based on the current time of day.
 */
function setGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "";
  if (hour < 12) {
    greeting = "Good morning,";
  } else if (hour < 17) {
    greeting = "Good afternoon,";
  } else {
    greeting = "Good evening,";
  }
  document.getElementById("day-time").innerText = greeting;
}

/**
 * Displays the current user's name from sessionStorage.
 * Removes the comma from the greeting if no user name exists.
 */
function displayUser() {
  const userName = sessionStorage.getItem("currentUser");
  let user = document.getElementById("hello");
  if (userName) {
    user.innerText = userName;
  } else {
    user.innerText = "";
    removeComma();
  }
}

/**
 * Removes the comma from the greeting text if no user name is shown.
 */
function removeComma() {
  let commaText = document.getElementById("day-time").textContent;
  commaText = commaText.replace(",", "");
  document.getElementById("day-time").innerText = commaText;
}