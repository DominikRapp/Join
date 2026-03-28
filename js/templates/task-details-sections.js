/**
 * Creates the HTML header for a task card, including type and AI badge if needed.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {Function} getTaskCreatorMeta - Function to resolve creator metadata.
 * @returns {string} The HTML string for the task header.
 */
export function getTaskHeader(task, taskId, getTaskCreatorMeta) {
    let taskTypeClass = "category-default";
    if (task.type === "User Story") taskTypeClass = "category-user-story";
    else if (task.type === "Technical Task")
        taskTypeClass = "category-technical-task";
    else if (task.type === "Meeting") taskTypeClass = "category-meeting";
    const creatorMeta = getTaskCreatorMeta(task);
    return `
    <div class="taskCardField titleBar">
      <div class="task-category ${taskTypeClass}">${task.type ?? ""}</div>
      ${creatorMeta.isAIGenerated ? getAIGeneratedTicketHtml() : ""}
    </div>
    <div class="taskCardField titleText">${task.title ?? ""}</div>
  `;
}

/**
 * Returns the HTML for the AI-generated ticket badge.
 * @returns {string} The HTML string for the AI badge.
 */
function getAIGeneratedTicketHtml() {
    return `
    <div class="task-ai-generated-badge">
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.8708 9.25104L9.9 12.4135C9.73195 12.6733 9.49896 12.7802 9.20104 12.7344C8.90313 12.6885 8.71597 12.5128 8.63958 12.2073L7.99792 9.64063L1.74167 15.8969C1.57361 16.0649 1.36354 16.1528 1.11146 16.1604C0.859375 16.1681 0.641667 16.0802 0.458333 15.8969C0.290278 15.7288 0.20625 15.5149 0.20625 15.2552C0.20625 14.9955 0.290278 14.7816 0.458333 14.6135L6.71458 8.33438L4.14792 7.69271C3.84236 7.61632 3.66667 7.42917 3.62083 7.13125C3.575 6.83333 3.68194 6.60035 3.94167 6.43229L7.10417 4.48438L6.82917 0.748958C6.79861 0.443403 6.92083 0.221875 7.19583 0.084375C7.47083 -0.053125 7.72292 -0.0225695 7.95208 0.176042L10.8167 2.58229L14.2771 1.18438C14.5674 1.06215 14.8194 1.10799 15.0333 1.32188C15.2472 1.53576 15.2931 1.78785 15.1708 2.07812L13.7729 5.53854L16.1792 8.38021C16.3778 8.60938 16.4083 8.86146 16.2708 9.13646C16.1333 9.41146 15.9118 9.53368 15.6063 9.50313L11.8708 9.25104ZM0.1375 3.10938C0.0458333 3.01771 0 2.91076 0 2.78854C0 2.66632 0.0458333 2.55938 0.1375 2.46771L1.32917 1.27604C1.42083 1.18438 1.52778 1.13854 1.65 1.13854C1.77222 1.13854 1.87917 1.18438 1.97083 1.27604L3.1625 2.46771C3.25417 2.55938 3.3 2.66632 3.3 2.78854C3.3 2.91076 3.25417 3.01771 3.1625 3.10938L1.97083 4.30104C1.87917 4.39271 1.77222 4.43854 1.65 4.43854C1.52778 4.43854 1.42083 4.39271 1.32917 4.30104L0.1375 3.10938ZM9.78542 9.13646L10.8854 7.32604L13.0167 7.48646L11.6417 5.85938L12.4438 3.88854L10.4729 4.69063L8.84583 3.33854L9.00625 5.44688L7.19583 6.56979L9.25834 7.07396L9.78542 9.13646ZM13.2458 16.2177L12.0542 15.026C11.9625 14.9344 11.9167 14.8274 11.9167 14.7052C11.9167 14.583 11.9625 14.476 12.0542 14.3844L13.2458 13.1927C13.3375 13.101 13.4444 13.0552 13.5667 13.0552C13.6889 13.0552 13.7958 13.101 13.8875 13.1927L15.0792 14.3844C15.1708 14.476 15.2167 14.583 15.2167 14.7052C15.2167 14.8274 15.1708 14.9344 15.0792 15.026L13.8875 16.2177C13.7958 16.3094 13.6889 16.3552 13.5667 16.3552C13.4444 16.3552 13.3375 16.3094 13.2458 16.2177Z" fill="url(#paint0_linear_352201_3537)"/>
        <defs>
          <linearGradient id="paint0_linear_352201_3537" x1="0.000349961" y1="8.19715" x2="16.3552" y2="8.19715" gradientUnits="userSpaceOnUse">
            <stop stop-color="#9327FF"/>
            <stop offset="1" stop-color="#2EA1DC"/>
          </linearGradient>
        </defs>
      </svg>
      <span>AI-generated ticket</span>
    </div>
  `;
}

/**
 * Creates the HTML description section for a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the task description.
 */
export function getTaskDescription(task) {
    return `
    <div class="taskCardField description">
      <p>${task.description ?? ""}</p>
    </div>
  `;
}

/**
 * Creates the HTML due date section for a task card.
 * @param {string} formattedDeadline - The already formatted due date.
 * @returns {string} The HTML string for the due date section.
 */
export function getTaskDueDate(formattedDeadline) {
    return `
    <div class="taskCardField date">
      <p>Due date:</p><p>${formattedDeadline}</p>
    </div>
  `;
}

/**
 * Returns the formatted priority text.
 * @param {string} priority - The priority value of the task.
 * @returns {string} The formatted priority text.
 */
function getPriorityText(priority) {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "No";
}

/**
 * Creates the HTML display for the task priority.
 * @param {string} priorityClass - The CSS class for the priority.
 * @param {string} priorityText - The display text for the priority.
 * @returns {string} The HTML string for the priority display.
 */
function getPriorityDisplayHtml(priorityClass, priorityText) {
    return `
    <div class="priority-display ${priorityClass}" data-priority="${priorityClass}">
      <p>${priorityText}</p>
      <img src="../assets/icons/property/${priorityClass}.svg" alt="${priorityText} Priority Icon">
    </div>
  `;
}

/**
 * Creates the HTML priority section for a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the task priority section.
 */
export function getTaskPriority(task) {
    const priorityClass = task.priority?.toLowerCase() ?? "";
    const priorityText = getPriorityText(task.priority);
    return `
    <div class="taskCardField priority-section">
      <p>Priority:</p>${getPriorityDisplayHtml(priorityClass, priorityText)}
    </div>
  `;
}

/**
 * Returns the HTML badge for the creator type.
 * @param {string} creatorType - The creator type, for example "extern" or "member".
 * @returns {string} The HTML string for the creator badge.
 */
function getCreatorBadgeHtml(creatorType) {
    if (creatorType === "extern") {
        return `
      <span class="task-detail-creator-badge creator-badge-extern">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 14C6.04333 14 5.13917 13.8162 4.2875 13.4487C3.43583 13.0812 2.69208 12.5796 2.05625 11.9437C1.42042 11.3079 0.91875 10.5642 0.55125 9.7125C0.18375 8.86083 0 7.95667 0 7C0 6.03167 0.18375 5.12458 0.55125 4.27875C0.91875 3.43292 1.42042 2.69208 2.05625 2.05625C2.69208 1.42042 3.43583 0.91875 4.2875 0.55125C5.13917 0.18375 6.04333 0 7 0C7.96833 0 8.87542 0.18375 9.72125 0.55125C10.5671 0.91875 11.3079 1.42042 11.9437 2.05625C12.5796 2.69208 13.0812 3.43292 13.4487 4.27875C13.8162 5.12458 14 6.03167 14 7C14 7.95667 13.8162 8.86083 13.4487 9.7125C13.0812 10.5642 12.5796 11.3079 11.9437 11.9437C11.3079 12.5796 10.5671 13.0812 9.72125 13.4487C8.87542 13.8162 7.96833 14 7 14ZM7 12.565C7.30333 12.145 7.56583 11.7075 7.7875 11.2525C8.00917 10.7975 8.19 10.3133 8.33 9.8H5.67C5.81 10.3133 5.99083 10.7975 6.2125 11.2525C6.43417 11.7075 6.69667 12.145 7 12.565ZM5.18 12.285C4.97 11.9 4.78625 11.5004 4.62875 11.0863C4.47125 10.6721 4.34 10.2433 4.235 9.8H2.17C2.50833 10.3833 2.93125 10.8908 3.43875 11.3225C3.94625 11.7542 4.52667 12.075 5.18 12.285ZM8.82 12.285C9.47333 12.075 10.0538 11.7542 10.5613 11.3225C11.0688 10.8908 11.4917 10.3833 11.83 9.8H9.765C9.66 10.2433 9.52875 10.6721 9.37125 11.0863C9.21375 11.5004 9.03 11.9 8.82 12.285ZM1.575 8.4H3.955C3.92 8.16667 3.89375 7.93625 3.87625 7.70875C3.85875 7.48125 3.85 7.245 3.85 7C3.85 6.755 3.85875 6.51875 3.87625 6.29125C3.89375 6.06375 3.92 5.83333 3.955 5.6H1.575C1.51667 5.83333 1.47292 6.06375 1.44375 6.29125C1.41458 6.51875 1.4 6.755 1.4 7C1.4 7.245 1.41458 7.48125 1.44375 7.70875C1.47292 7.93625 1.51667 8.16667 1.575 8.4ZM5.355 8.4H8.645C8.68 8.16667 8.70625 7.93625 8.72375 7.70875C8.74125 7.48125 8.75 7.245 8.75 7C8.75 6.755 8.74125 6.51875 8.72375 6.29125C8.70625 6.06375 8.68 5.83333 8.645 5.6H5.355C5.32 5.83333 5.29375 6.06375 5.27625 6.29125C5.25875 6.51875 5.25 6.755 5.25 7C5.25 7.245 5.25875 7.48125 5.27625 7.70875C5.29375 7.93625 5.32 8.16667 5.355 8.4ZM10.045 8.4H12.425C12.4833 8.16667 12.5271 7.93625 12.5562 7.70875C12.5854 7.48125 12.6 7.245 12.6 7C12.6 6.755 12.5854 6.51875 12.5562 6.29125C12.5271 6.06375 12.4833 5.83333 12.425 5.6H10.045C10.08 5.83333 10.1062 6.06375 10.1238 6.29125C10.1413 6.51875 10.15 6.755 10.15 7C10.15 7.245 10.1413 7.48125 10.1238 7.70875C10.1062 7.93625 10.08 8.16667 10.045 8.4ZM9.765 4.2H11.83C11.4917 3.61667 11.0688 3.10917 10.5613 2.6775C10.0538 2.24583 9.47333 1.925 8.82 1.715C9.03 2.1 9.21375 2.49958 9.37125 2.91375C9.52875 3.32792 9.66 3.75667 9.765 4.2ZM5.67 4.2H8.33C8.19 3.68667 8.00917 3.2025 7.7875 2.7475C7.56583 2.2925 7.30333 1.855 7 1.435C6.69667 1.855 6.43417 2.2925 6.2125 2.7475C5.99083 3.2025 5.81 3.68667 5.67 4.2ZM2.17 4.2H4.235C4.34 3.75667 4.47125 3.32792 4.62875 2.91375C4.78625 2.49958 4.97 2.1 5.18 1.715C4.52667 1.925 3.94625 2.24583 3.43875 2.6775C2.93125 3.10917 2.50833 3.61667 2.17 4.2Z" fill="#0B3681"/>
        </svg>
        Extern
      </span>
    `;
    }
    return `
    <span class="task-detail-creator-badge creator-badge-member">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 10.8C0 10.3364 0.119318 9.91023 0.357955 9.52159C0.596591 9.13295 0.913636 8.83636 1.30909 8.63182C2.15455 8.20909 3.01364 7.89204 3.88636 7.68068C4.75909 7.46932 5.64545 7.36364 6.54545 7.36364C7.44545 7.36364 8.33182 7.46932 9.20455 7.68068C10.0773 7.89204 10.9364 8.20909 11.7818 8.63182C12.1773 8.83636 12.4943 9.13295 12.733 9.52159C12.9716 9.91023 13.0909 10.3364 13.0909 10.8V11.4545C13.0909 11.9045 12.9307 12.2898 12.6102 12.6102C12.2898 12.9307 11.9045 13.0909 11.4545 13.0909H1.63636C1.18636 13.0909 0.801136 12.9307 0.480682 12.6102C0.160227 12.2898 0 11.9045 0 11.4545V10.8ZM16.3636 13.0909H14.2773C14.4273 12.8455 14.5398 12.583 14.6148 12.3034C14.6898 12.0239 14.7273 11.7409 14.7273 11.4545V10.6364C14.7273 10.0364 14.5602 9.46023 14.2261 8.90795C13.892 8.35568 13.4182 7.88182 12.8045 7.48636C13.5 7.56818 14.1545 7.70795 14.7682 7.90568C15.3818 8.10341 15.9545 8.34545 16.4864 8.63182C16.9773 8.90454 17.3523 9.20795 17.6114 9.54204C17.8705 9.87614 18 10.2409 18 10.6364V11.4545C18 11.9045 17.8398 12.2898 17.5193 12.6102C17.1989 12.9307 16.8136 13.0909 16.3636 13.0909ZM6.54545 6.54545C5.64545 6.54545 4.875 6.225 4.23409 5.58409C3.59318 4.94318 3.27273 4.17273 3.27273 3.27273C3.27273 2.37273 3.59318 1.60227 4.23409 0.961364C4.875 0.320455 5.64545 0 6.54545 0C7.44545 0 8.21591 0.320455 8.85682 0.961364C9.49773 1.60227 9.81818 2.37273 9.81818 3.27273C9.81818 4.17273 9.49773 4.94318 8.85682 5.58409C8.21591 6.225 7.44545 6.54545 6.54545 6.54545ZM14.7273 3.27273C14.7273 4.17273 14.4068 4.94318 13.7659 5.58409C13.125 6.225 12.3545 6.54545 11.4545 6.54545C11.3045 6.54545 11.1136 6.52841 10.8818 6.49432C10.65 6.46023 10.4591 6.42273 10.3091 6.38182C10.6773 5.94545 10.9602 5.46136 11.158 4.92954C11.3557 4.39773 11.4545 3.84545 11.4545 3.27273C11.4545 2.7 11.3557 2.14773 11.158 1.61591C10.9602 1.08409 10.6773 0.6 10.3091 0.163636C10.5 0.0954545 10.6909 0.0511364 10.8818 0.0306818C11.0727 0.0102273 11.2636 0 11.4545 0C12.3545 0 13.125 0.320455 13.7659 0.961364C14.4068 1.60227 14.7273 2.37273 14.7273 3.27273ZM1.63636 11.4545H11.4545V10.8C11.4545 10.65 11.417 10.5136 11.342 10.3909C11.267 10.2682 11.1682 10.1727 11.0455 10.1045C10.3091 9.73636 9.56591 9.46023 8.81591 9.27614C8.06591 9.09204 7.30909 9 6.54545 9C5.78182 9 5.025 9.09204 4.275 9.27614C3.525 9.46023 2.78182 9.73636 2.04545 10.1045C1.92273 10.1727 1.82386 10.2682 1.74886 10.3909C1.67386 10.5136 1.63636 10.65 1.63636 10.8V11.4545ZM6.54545 4.90909C6.99545 4.90909 7.38068 4.74886 7.70114 4.42841C8.02159 4.10795 8.18182 3.72273 8.18182 3.27273C8.18182 2.82273 8.02159 2.4375 7.70114 2.11705C7.38068 1.79659 6.99545 1.63636 6.54545 1.63636C6.09545 1.63636 5.71023 1.79659 5.38977 2.11705C5.06932 2.4375 4.90909 2.82273 4.90909 3.27273C4.90909 3.72273 5.06932 4.10795 5.38977 4.42841C5.71023 4.74886 6.09545 4.90909 6.54545 4.90909Z" fill="#0B3681"/>
      </svg>
      Member
    </span>
  `;
}

/**
 * Returns the HTML for the creator source label.
 * @param {string} creatorSource - The creator source, for example "email" or "profile".
 * @returns {string} The HTML string for the creator source.
 */
function getCreatorSourceHtml(creatorSource) {
    if (creatorSource === "email") {
        return `
      <span class="task-detail-creator-source">
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.63636 12.8C1.18636 12.8 0.801136 12.6433 0.480682 12.33C0.160227 12.0167 0 11.64 0 11.2V1.6C0 1.16 0.160227 0.783333 0.480682 0.47C0.801136 0.156667 1.18636 0 1.63636 0H14.7273C15.1773 0 15.5625 0.156667 15.883 0.47C16.2034 0.783333 16.3636 1.16 16.3636 1.6V4.8C16.3636 5.02667 16.2852 5.21667 16.1284 5.37C15.9716 5.52333 15.7773 5.6 15.5455 5.6C15.3136 5.6 15.1193 5.52333 14.9625 5.37C14.8057 5.21667 14.7273 5.02667 14.7273 4.8V3.2L8.61136 6.94C8.54318 6.98 8.47159 7.01 8.39659 7.03C8.32159 7.05 8.25 7.06 8.18182 7.06C8.11364 7.06 8.04205 7.05 7.96705 7.03C7.89205 7.01 7.82045 6.98 7.75227 6.94L1.63636 3.2V11.2H9C9.23182 11.2 9.42614 11.2767 9.58296 11.43C9.73977 11.5833 9.81818 11.7733 9.81818 12C9.81818 12.2267 9.73977 12.4167 9.58296 12.57C9.42614 12.7233 9.23182 12.8 9 12.8H1.63636ZM8.18182 5.6L14.7273 1.6H1.63636L8.18182 5.6ZM14.7273 16C13.8273 16 13.0568 15.6867 12.4159 15.06C11.775 14.4333 11.4545 13.68 11.4545 12.8V9.2C11.4545 8.64 11.6523 8.16667 12.0477 7.78C12.4432 7.39333 12.9273 7.2 13.5 7.2C14.0727 7.2 14.5568 7.39333 14.9523 7.78C15.3477 8.16667 15.5455 8.64 15.5455 9.2V12C15.5455 12.2267 15.467 12.4167 15.3102 12.57C15.1534 12.7233 14.9591 12.8 14.7273 12.8C14.4955 12.8 14.3011 12.7233 14.1443 12.57C13.9875 12.4167 13.9091 12.2267 13.9091 12V9.2C13.9091 9.09333 13.8682 9 13.7864 8.92C13.7045 8.84 13.6091 8.8 13.5 8.8C13.3909 8.8 13.2955 8.84 13.2136 8.92C13.1318 9 13.0909 9.09333 13.0909 9.2V12.8C13.0909 13.24 13.2511 13.6167 13.5716 13.93C13.892 14.2433 14.2773 14.4 14.7273 14.4C15.1773 14.4 15.5625 14.2433 15.883 13.93C16.2034 13.6167 16.3636 13.24 16.3636 12.8V10.4C16.3636 10.1733 16.442 9.98333 16.5989 9.83C16.7557 9.67667 16.95 9.6 17.1818 9.6C17.4136 9.6 17.608 9.67667 17.7648 9.83C17.9216 9.98333 18 10.1733 18 10.4V12.8C18 13.68 17.6795 14.4333 17.0386 15.06C16.3977 15.6867 15.6273 16 14.7273 16Z" fill="#29ABE2"/>
        </svg>
        E-mail
      </span>
    `;
    }
    return `
    <span class="task-detail-creator-source">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7C6.0375 7 5.21354 6.65729 4.52813 5.97188C3.84271 5.28646 3.5 4.4625 3.5 3.5C3.5 2.5375 3.84271 1.71354 4.52813 1.02813C5.21354 0.342708 6.0375 0 7 0C7.9625 0 8.78646 0.342708 9.47188 1.02813C10.1573 1.71354 10.5 2.5375 10.5 3.5C10.5 4.4625 10.1573 5.28646 9.47188 5.97188C8.78646 6.65729 7.9625 7 7 7ZM0 12.25V11.55C0 11.0542 0.127604 10.5984 0.382812 10.1828C0.638021 9.76719 0.977083 9.45 1.4 9.23125C2.30417 8.77917 3.22292 8.4401 4.15625 8.21406C5.08958 7.98802 6.0375 7.875 7 7.875C7.9625 7.875 8.91042 7.98802 9.84375 8.21406C10.7771 8.4401 11.6958 8.77917 12.6 9.23125C13.0229 9.45 13.362 9.76719 13.6172 10.1828C13.8724 10.5984 14 11.0542 14 11.55V12.25C14 12.7312 13.8286 13.1432 13.4859 13.4859C13.1432 13.8286 12.7312 14 12.25 14H1.75C1.26875 14 0.856771 13.8286 0.514063 13.4859C0.171354 13.1432 0 12.7312 0 12.25ZM1.75 12.25H12.25V11.55C12.25 11.3896 12.2099 11.2437 12.1297 11.1125C12.0495 10.9812 11.9438 10.8792 11.8125 10.8063C11.025 10.4125 10.2302 10.1172 9.42813 9.92031C8.62604 9.72344 7.81667 9.625 7 9.625C6.18333 9.625 5.37396 9.72344 4.57188 9.92031C3.76979 10.1172 2.975 10.4125 2.1875 10.8063C2.05625 10.8792 1.95052 10.9812 1.87031 11.1125C1.7901 11.2437 1.75 11.3896 1.75 11.55V12.25ZM7 5.25C7.48125 5.25 7.89323 5.07865 8.23594 4.73594C8.57865 4.39323 8.75 3.98125 8.75 3.5C8.75 3.01875 8.57865 2.60677 8.23594 2.26406C7.89323 1.92135 7.48125 1.75 7 1.75C6.51875 1.75 6.10677 1.92135 5.76406 2.26406C5.42135 2.60677 5.25 3.01875 5.25 3.5C5.25 3.98125 5.42135 4.39323 5.76406 4.73594C6.10677 5.07865 6.51875 5.25 7 5.25Z" fill="#29ABE2"/>
      </svg>
      Profil
    </span>
  `;
}

/**
 * Creates the HTML section that shows the task creator information.
 * @param {object} task - The task object.
 * @param {Function} getTaskCreatorMeta - Function to resolve creator metadata.
 * @returns {string} The HTML string for the creator section.
 */
export function getTaskCreatorSection(task, getTaskCreatorMeta) {
    const creatorMeta = getTaskCreatorMeta(task);
    return `
    <div class="taskCardField creator-section">
      <div class="creator-badge">
        <p>Creator:</p>
        ${getCreatorBadgeHtml(creatorMeta.creatorType)}
      </div>
      <div class="name-source">
        <div class="task-detail-creator-line">
          <span class="task-detail-creator-name">${creatorMeta.creatorName}</span>
        </div>
        <div class="task-detail-creator-line">
          ${getCreatorSourceHtml(creatorMeta.creatorSource)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML string for a single subtask item.
 * @param {string} subtaskName - The subtask name.
 * @param {boolean} isChecked - Whether the subtask is checked.
 * @param {string} taskId - The ID of the parent task.
 * @param {number|string} subtaskIndex - The index of the subtask.
 * @returns {string} The HTML string for the subtask item.
 */
function createSubtaskHtml(subtaskName, isChecked, taskId, subtaskIndex) {
    return `
    <div class="subtask-item">
      <label for="subtask-${taskId}-${subtaskIndex}" class="subtask-label" style="cursor:pointer;">
        <input type="checkbox" class="subtask-checkbox" id="subtask-${taskId}-${subtaskIndex}"
          data-task-id="${taskId}" data-subtask-index="${subtaskIndex}" ${isChecked ? "checked" : ""}
          onclick="toggleCheckbox(this)">
        <span class="checkbox-svg-wrapper" onclick="toggleCheckbox(this.parentElement.querySelector('input[type=checkbox]'))" style="display:inline-flex;align-items:center;cursor:pointer;">
          ${isChecked
            ? `<svg class="checkbox-icon checked" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>
                <path d="M3 9L7 13L15 3.5" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`
            : `<svg class="checkbox-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>
              </svg>`
        }
        </span>
        <span>${subtaskName}</span>
      </label>
    </div>
  `;
}

/**
 * Returns whether a subtask is checked.
 * @param {object} task - The task object containing checked subtasks.
 * @param {number|string} index - The index of the subtask.
 * @returns {boolean} True if the subtask is checked, otherwise false.
 */
function getSubtaskCheckedStatus(task, index) {
    return (
        Array.isArray(task.checkedSubtasks) && task.checkedSubtasks[index] === true
    );
}

/**
 * Renders the HTML for a single subtask of a task.
 * @param {object} task - The task object.
 * @param {number|string} i - The index of the subtask.
 * @returns {string} The HTML string for the single subtask.
 */
function renderSingleSubtask(task, i) {
    const subtaskName = task.totalSubtasks[i];
    const isChecked = getSubtaskCheckedStatus(task, i);
    return createSubtaskHtml(subtaskName, isChecked, task.id, i);
}

/**
 * Renders all subtasks of a task as one combined HTML string.
 * @param {object} task - The task object.
 * @returns {string} The combined HTML string for all subtasks.
 */
function renderSubtasks(task) {
    if (!task?.totalSubtasks || Object.keys(task.totalSubtasks).length === 0) {
        return "";
    }
    let subtasksHtml = "";
    for (const i in task.totalSubtasks) {
        subtasksHtml += renderSingleSubtask(task, i);
    }
    return subtasksHtml;
}

/**
 * Creates the HTML section for all subtasks of a task and attaches
 * visual checkbox update handlers after rendering.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the subtasks section.
 */
export function getTaskSubtasksSection(task) {
    const subtasksHtml = renderSubtasks(task);
    if (subtasksHtml === "") return "";
    setTimeout(() => {
        document.querySelectorAll(".subtask-label").forEach((label) => {
            const checkbox = label.querySelector(".subtask-checkbox");
            const icon = label.querySelector(".checkbox-icon");
            if (!checkbox || !icon) return;
            label.addEventListener("click", function (e) {
                if (e.target.tagName === "SPAN") return;
                setTimeout(() => {
                    if (checkbox.checked) {
                        icon.src = "../assets/icons/btn/checkbox-filled-white.svg";
                        icon.alt = "checkbox filled";
                        icon.classList.add("checked");
                    } else {
                        icon.src = "../assets/icons/btn/checkbox-empty-black.svg";
                        icon.alt = "checkbox empty";
                        icon.classList.remove("checked");
                    }
                }, 0);
            });
        });
    }, 0);
    return `
    <div class="taskCardField subtasks-section">
      <p class="subtasks-title">Subtasks:</p>
      <div class="subtaskList">${subtasksHtml}</div>
    </div>
  `;
}

/**
 * Returns the HTML for the edit button of a task.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML string for the edit button.
 */
function getEditButtonHtml(taskId) {
    return `<button class="edit-task-btn" data-task-id="${taskId}"><svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 13.5V16H4.5L14.13 6.37L11.63 3.87L2 13.5ZM16.73 5.04C17.1 4.67 17.1 4.09 16.73 3.72L15.28 2.27C14.91 1.9 14.33 1.9 13.96 2.27L12.54 3.69L15.04 6.19L16.73 5.04Z" fill="currentColor"/></svg>Edit</button>`;
}

/**
 * Returns the HTML for the vertical separator between action buttons.
 * @returns {string} The HTML string for the separator.
 */
function getVerticalSeparator() {
    return `<span class="task-detail-separator" style="display:flex;align-items:center;"><svg width="1" height="24" viewBox="0 0 1 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="24" fill="#D1D1D1"/></svg></span>`;
}

/**
 * Creates the HTML string for the delete button of a task.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML string for the delete button.
 */
function getDeleteButtonHtml(taskId) {
    return `
    <button class="delete-task-btn" data-task-id="${taskId}">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 7V13H8V7H6ZM10 7V13H12V7H10ZM4 15V5H14V15C14 15.55 13.55 16 13 16H5C4.45 16 4 15.55 4 15ZM16 3H13.5L12.71 2.21C12.53 2.03 12.28 1.92 12 1.92H6C5.72 1.92 5.47 2.03 5.29 2.21L4.5 3H2V5H16V3Z" fill="currentColor"/>
      </svg>
      Delete
    </button>
  `;
}

/**
 * Creates the action menu for a task card with delete and edit controls.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML string for the card menu.
 */
export function getCardMenu(taskId) {
    return `
    <div class="cardMenu" style="display:flex;align-items:center;gap:16px;">
      ${getDeleteButtonHtml(taskId)}
      ${getVerticalSeparator()}
      ${getEditButtonHtml(taskId)}
    </div>
  `;
}