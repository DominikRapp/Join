# Join – AI Issue Collector for a Kanban Board

Welcome to **Join**, a modern web-based Kanban app for efficient task management, team collaboration, and **AI-supported issue intake via email**.

## 🔍 Project Overview

**Join** started as a Kanban board project and was later extended into a more advanced portfolio and demo application.

In this version, the project includes an **AI-powered Issue Collector** that allows stakeholders to submit requests by email. Incoming emails are processed through **n8n**, analyzed with AI, transformed into structured ticket data, and created as new tasks in the Join board.

This makes the project more than just a classic Kanban app — it becomes a small workflow-driven system that combines frontend development, Firebase, automation, and AI-supported ticket creation.

## 💡 Features

### Board Features

- Create, edit, and delete tasks
- Drag-and-drop for changing task status
- Assign tasks to team members
- Categories, priorities, deadlines, and subtasks
- Search and filter functionality
- Responsive design for desktop and mobile
- Firebase-based data handling

### AI Issue Collector Features

- Dedicated stakeholder request flow
- Requests can be submitted via a dedicated email address
- Incoming emails are processed automatically with **n8n**
- AI extracts and generates:
  - ticket title
  - short description
  - priority
  - task type
  - deadline
- New tickets are created automatically in Firebase
- New email-generated tickets are placed in the **Triage** column
- Ticket creator data is stored automatically
- Distinction between **internal** and **external** creators
- AI-generated tickets are marked in the task data
- Automatic confirmation emails for stakeholders
- Automatic status notification emails when ticket status changes
- Daily AI request limit of **10 tickets** as a cost airbag

## 🛠️ Tech Stack

- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **Frontend:** Vanilla JavaScript
- **Storage / Backend:** Firebase Realtime Database
- **Automation:** n8n
- **AI Processing:** Google Gemini via n8n
- **Mail Handling:** IMAP + SMTP

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/<your-username>/join.git
cd join
```

### 2. Open the project locally

You can open the project in **VS Code** and run it with a local server.

Start from the project root and open:

- `index.html`

### 3. Project Structure

- `index.html`, `main.js` – Entry point and bootstrap logic
- `html/` – App pages such as board, summary, contacts, legal pages, and stakeholder request page
- `js/` – JavaScript modules for logic, UI, templates, events, data, and utilities
- `styles/` – CSS files for layout, components, and responsive styling
- `assets/` – Fonts, icons, and images
- `n8n/` – Exported n8n workflow JSON files

### 4. Usage

1. Open the app as a team member and explore the board
2. Create and manage tasks in the Kanban interface
3. Use drag-and-drop to move tasks between columns
4. Use the stakeholder request flow for the demo
5. Send a request email to the configured mailbox
6. Let n8n process the mail and create the ticket automatically
7. Verify that the ticket appears in **Triage**
8. Move the ticket and trigger a status notification email

### 5. Development & Customization

- All frontend logic is written in modular JavaScript files under `js/`
- Styling is organized in the `styles/` folder
- Firebase is used as the central project data source
- n8n handles incoming emails, AI parsing, Firebase task creation, and outgoing mail notifications

## 🧠 Board & Ticket Logic

This Join version uses a dedicated **Triage** column as the default backlog for incoming work.

Important task metadata includes:

- `creatorName`
- `creatorEmail`
- `creatorSource`
- `creatorType`
- `isAIGenerated`

This allows the UI and workflows to distinguish between:

- manually created internal tickets
- externally submitted stakeholder tickets
- AI-generated tickets
- status notification targets

## 📬 n8n Workflows

This project includes exported n8n workflows that should be stored inside a dedicated `n8n` folder in the repository.

Recommended structure:

```text
n8n/
├── Join - KI Verarbeitung von Mails.json
└── Join - Status Notification Mail.json
```

### Workflow: Join - KI Verarbeitung von Mails

Handles the complete incoming stakeholder request flow:

- reads incoming emails from the mailbox
- checks the current daily AI request limit
- analyzes valid request emails with AI
- creates a Join-compatible ticket object
- stores the new ticket in Firebase
- updates the daily request counter
- updates the next task number
- sends a confirmation or fallback reply

### Workflow: Join - Status Notification Mail

Handles outgoing creator notifications:

- reads open status notification entries from Firebase
- builds human-readable status update emails
- sends the email to the ticket creator
- marks processed notifications in Firebase

## 🔥 Firebase Highlights

Important Firebase sections used in this project:

- `boards`
- `tasks`
- `contacts`
- `users`
- `taskMeta`
- `emailRequestLimit`
- `issueCollector`
- `statusNotifications`

Relevant automation defaults include:

- `emailRequestLimit.dailyLimit = 10`
- `issueCollector.defaults.columnID = triage`
- `issueCollector.defaults.creatorSource = email`
- `issueCollector.defaults.creatorType = extern`
- `issueCollector.defaults.isAIGenerated = true`

## 🎮 Demo Usage

A typical demo flow can look like this:

1. Open the landing page
2. Show the split between stakeholder access and team member access
3. Explain how a request is submitted by email
4. Trigger or show an incoming request email
5. Show the created ticket in **Triage**
6. Open the task details and point out creator and AI metadata
7. Move the ticket to another column
8. Show the automatic status notification process

## ⚠️ Important Security Note

Do **not** commit real credentials or sensitive data to GitHub.

This includes for example:

- IMAP credentials
- SMTP credentials
- API keys
- personal mailbox data
- `N8N_ENCRYPTION_KEY`
- production secrets of any kind

These values should be excluded properly via `.gitignore` or local-only environment handling.

## 📄 License & Credits

The original Join board was based on a group project context.

The **AI Issue Collector**, stakeholder request flow, Firebase extensions, creator logic, n8n workflows, and email automation were added later as an individual project extension.

This repository is intended for educational, showcase, and portfolio use.

## 📬 Contact

For questions or feedback, use the contact option connected to the repository or portfolio profile.
