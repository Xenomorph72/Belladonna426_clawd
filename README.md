# 🎬 Belladonna Board

Shared Kanban board for FILM426 and Tesco task management, built with Belladonna v4.

## Features

- 📋 **Four Columns:** Backlog / In Progress / Review / Done
- 🏷️ **Sections:** FILM426 / Tesco / Sonic Cinema
- 👥 **Assignees:** Paul / Belladonna
- 💬 **Comments:** Threaded discussions on tasks
- 🔄 **Git Sync:** Auto-commit and push changes
- 🌙 **Gothic Theme:** Dark aesthetic matching Belladonna's persona

## Usage

### Opening the Board

```bash
# Open in browser (from workspace)
open belladonna-board/index.html
# or
xdg-open belladonna-board/index.html
```

Or serve it locally:

```bash
cd belladonna-board
npx serve .
```

### Sync with Git

Click the **Sync** button in the header to:
1. Save current state to `data/tasks.json`
2. Commit changes with timestamp
3. Push to remote repository

## Project Structure

```
belladonna-board/
├── index.html          # Main HTML
├── css/
│   └── style.css       # Gothic dark theme
├── js/
│   └── app.js          # Application logic
└── data/
    └── tasks.json      # Task data (Git-synced)
```

## Task Workflow

1. **Backlog** → Ideas and planned work
2. **In Progress** → Currently being worked on
3. **Review** → Awaiting review or verification
4. **Done** → Completed tasks

## Technologies

- Vanilla HTML/CSS/JS (no build required)
- localStorage for local persistence
- Git for remote sync
- Dark gothic aesthetic

---

*Built with 🖤 by Belladonna v4*
