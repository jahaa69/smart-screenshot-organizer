# Smart Screenshot Organizer

Organize your screenshots with intelligence and elegance!

![Version Badge](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

DashBoard : 
<img width="1907" height="977" alt="image" src="https://github.com/user-attachments/assets/e91719d3-3211-4096-bfa2-16cb9f01c806" />

<img width="1907" height="998" alt="image" src="https://github.com/user-attachments/assets/4612afac-6a1c-4d7b-8c61-c7ba73003f07" />
 
Double clic on a file :
<img width="755" height="631" alt="image" src="https://github.com/user-attachments/assets/d4fba2cc-1c8b-4b62-b1b2-673f6ca7d9c8" />
<img width="1585" height="153" alt="image" src="https://github.com/user-attachments/assets/c5d4a470-add8-4df0-a709-d3c4216991af" />
Right clic on a file : 
<img width="413" height="277" alt="image" src="https://github.com/user-attachments/assets/aa331559-f6b7-4d4d-9b91-3c6baccdc395" />
<img width="540" height="691" alt="image" src="https://github.com/user-attachments/assets/50f51b20-3fb4-4614-9567-fe8fd42b67a6" />
<img width="407" height="110" alt="image" src="https://github.com/user-attachments/assets/1c8b1f15-be3c-42ee-ae7c-237952cfdbfe" />
<img width="1188" height="806" alt="image" src="https://github.com/user-attachments/assets/27ba65ff-ca6a-486e-98a7-799298106609" />


---

## Project Overview

### Context

Managing screenshots can quickly become chaotic for anyone working on multiple projects or browsing sessions. Manual organization is slow and prone to errors.

### Problem

How can we automate the sorting and classification of screenshots while still providing clear tracking and customizable tags?

### Proposed Solution

*Smart Screenshot Organizer* monitors a selected folder, automatically renames each screenshot, organizes them by date and application, and allows tags to be added. The user keeps full control through a simple and visual dashboard.

---

## Features

### Core Features (MVP)

* **Auto rename**: Renames screenshots using the format `Screenshot_YYYY-MM-DD_AppName.png`
* **Auto organize**: Automatically sorts screenshots into subfolders by date
* **Tag system**: Manual or automatic tag assignment
* **Dashboard**: View statistics and history
* **Toggle ON/OFF**: Easily enable or disable the watcher

### Secondary Features

* System notifications for each processed screenshot
* Handling of locked or conflicting files
* History of processed screenshots

---

## Technical Architecture

* **Pattern:** MVVM (Model-View-ViewModel)
* **Main Process:** File management, watcher, IPC
* **Renderer Process:** User interface and dashboard
* **Directories:** `/src/main`, `/src/renderer`, `/src/shared`, `/assets`, `/doc`

---

## UML

* **Use Case Diagram:** User interaction with the watcher and the dashboard
* **Class Diagram:** Screenshot, ScreenshotWatcher, FileClassifier, FileService, TagManager, IPCHandlers
* **Sequence Diagram:** New file detected → classification → renaming → notification
* **Deployment Diagram:** Electron App → Node.js → File System / OS

---

## Technologies Used

* Electron (desktop application)
* Vue.js (interface)
* Node.js (local backend)
* fs / IPC (system interaction)

---

## Installation

### Requirements

* Node.js v18+
* NPM or Yarn
* Windows / macOS / Linux system

### Clone the repository

```bash
git clone https://github.com/jahaa69/smart-screenshot-organizer.git
cd smart-screenshot-organizer
```

### Install dependencies

```bash
npm install
sudo apt install libnss3
```

### Run in development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
```

---

## Testing & Error Handling

* Locked files are not moved and a notification is displayed
* Empty inputs or missing folders generate a clear error message
* Action history is kept for debugging and tracking purposes

---

## Future Improvements

* OCR integration to read screenshot content
* Automatic classification using AI
* Multi-folder and multi-user support
* CSV export of statistics

---

## AI Transparency 🤖

* **Prompts used:** Generation of UML diagrams and architecture suggestions
* **AI-generated parts:** Class diagrams, sequence diagrams, initial README structure
* **Manually developed parts:** Business logic, watcher, interface, and dashboard
* **AI critical review:** The initial watcher proposal was synchronous; it was refactored to async/await for better performance

---

## Self-Criticism

* OCR and automatic application recognition not implemented
* Multi-folder management needs improvement
* Dashboard simplified for the MVP but designed to scale
* Complete UML documentation provided to demonstrate the architecture

---

## License

MIT License – free to use and modify

---

Soléane and Bastien
