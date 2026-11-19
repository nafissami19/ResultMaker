# 🦅 Phoenix Result Maker

> Make one-page printable result sheets for NSU and BRACU model tests, keep a central ranking across batches, and turn solve sheets into checked answer keys.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Platform](https://img.shields.io/badge/Platform-Web_browser-lightgrey)](#-getting-started)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
  - [1. Result Maker](#1-result-maker)
  - [2. Central Ranking](#2-central-ranking)
  - [3. Table Maker](#3-table-maker)
- [Your Data](#-your-data)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Phoenix Result Maker** is a result tool for admission coaching centres, built around the **North South University (NSU)** and **BRAC University (BRACU)** admission tests. It has three parts, each a tab in the top bar:

| Tab | What it does |
| --- | --- |
| **Result Maker** | Enter or paste marks and get a single A4 landscape result sheet with NSU and BRACU side by side. |
| **Central Ranking** | Combine Model Test 1–5 results from several batches into one ranking. |
| **Table Maker** | Upload a solve sheet (.docx or .pdf) and get a checked, printable answer key. |

Everything runs in the browser. There is no server or database: your data stays on your computer.

---

## ✨ Features

### 📄 Result Maker
- **Editor and live preview side by side**: the A4 sheet updates as you type.
- **Spreadsheet-style grid**:
  - Blank cells instead of zeros.
  - A live total for each student.
  - Enter moves down a column.
- **NSU and BRACU sections handled for you**:
  - NSU columns are `S01, S02, S03, Essay`.
  - BRACU columns are `S01, Essay, S03, S04, S05` (and `S06` when used). For BRACU, Section 02 is always the Essay.
  - Anyone with S05/S06 marks is treated as BRACU. NSU rows lock S05/S06.
- **Fits one page**: font size and spacing shrink as the student list grows. A long single list splits into two columns.
- **Ranks with ties**: equal totals share a rank (1st, 2nd, 2nd, 4th). The top three get medal badges.
- **Saved tests**:
  - Save each test (Weekly Test 01, 02, …) and reopen it later.
  - The editor shows whether you have unsaved changes.
- **Exports**: PDF and PNG (always A4-shaped), CSV, and Print.

### 🏆 Central Ranking
- Combines Model Tests 1–5 from several batches, with Top 30 / All and a batch filter.
- Import by pasting from Excel or Google Sheets. Blank cells (a missed test) stay in the right column.
- Set the total marks ("out of 600").
- Exports: PDF (split into pages by the rows-per-page setting, 30 by default), PNG and CSV.

### 🧾 Table Maker
- Reads **.docx**, **.pdf** or pasted text.
- **Finds the solve sheet and splits it into sections** (e.g. `Section 1: …`, `Section A – […]`).
- **Reads answers from the answer tables** (`01. B`). It **cross-checks them against the explanations** (`01. (B) …`), and uses the explanations when a section has no table.
- **Checks for problems**:
  - Table and explanation disagree.
  - Missing answers.
  - Answers that stop before the last question in the paper.
- Skips written sections (composition / essay) and tells you it did.
- **Lets you edit**: change any answer, rename or hide sections, and set the title and badges.
- **Exports**: an A4 portrait answer key as PDF or PNG, with optional colour-coded letters.

### 🌓 General
- Light and dark mode, remembered between visits.
- Works on laptop, tablet and phone screens.

---

## 🚀 Getting Started

The app is plain HTML, CSS and JavaScript, so there is nothing to install or build. It does need an **internet connection**, because it loads fonts and its PDF/Word libraries from a CDN.

Run it through a small local web server (Table Maker needs this):

**Windows (Python launcher):**
```bash
py -m http.server 3000
```

**macOS / Linux:**
```bash
python3 -m http.server 3000
```

**Node.js:**
```bash
npx http-server -p 3000 -c-1
```

Then open <http://localhost:3000> in Chrome, Edge or Firefox.

> **Not seeing your latest changes?** Python's server lets the browser keep old copies of pages. Press **Ctrl+F5** to reload everything. When Table Maker changes, raise the `?v=` number on its `<iframe>` in `index.html`.

---

## 📖 How to Use

### 1. Result Maker
1. **Add students**: type them in with **Add student**, or press **Import** and paste rows from a spreadsheet:
   ```tsv
   Name          S01   S02   S03   S04   S05   S06
   John Doe      14    22    10    10
   Jane Smith    11    18    9     9     4     4
   ```
   For NSU, the 4th mark column is the Essay. For BRACU, the 2nd column is the Essay.
2. **Switch a student's type**: click the **NSU / BRACU** pill on their row.
3. **Set the headers**: open **Sheet settings** to change the headers, score label, footer title and date, and the display switches.
4. **Save the test**: press **Save**. It's saved under the footer test title. Open **Saved tests** to reopen an older test, start a **New test** (the title number goes up by one), or delete one.
5. **Export**: use **Download PDF**, **PNG** or **Print** above the preview, or **CSV** in the editor.

### 2. Central Ranking
1. Open the **Central Ranking** tab. It starts empty.
2. Press **Import batch**, enter the batch name, choose *Add to existing results* or *Replace the whole ranking*, and paste the rows.
   Supported layouts: `Name, MT1…MT5`; `Name, Batch, MT1…MT5`; `Rank, Name, Batch, MT1…MT5`.
3. Use **Top 30 / All** and the batch filter. **Export** gives PDF, PNG or CSV. **⋯** has Settings (total marks) and Clear all data.

### 3. Table Maker
1. Open the **Table Maker** tab and drop in a solve sheet (.docx or .pdf), or paste its text.
2. Read the **Checks** list. Fix anything marked amber or red under **Answers**.
3. Adjust the title and badges if needed, then press **Download PDF** or **PNG**.

Old `.doc` files can't be read in the browser. Save them as `.docx` or PDF first.

---

## 💾 Your Data

Everything is stored in your browser's `localStorage`:
- students and sheet settings
- saved tests
- the central ranking
- the last answer key
- your theme

Nothing is uploaded anywhere. This also means:
- **Each browser and computer has its own data.** A different browser, or another PC, won't see it.
- **Clearing your browser's site data deletes it.** Keep CSV/PDF exports of anything important.

---

## 🛠️ Technical Stack

- **Core**: plain HTML5, CSS3 (custom properties, flexbox, grid) and ES6+ JavaScript. No build step.
- **Rendering**: [html2canvas](https://html2canvas.hertzen.com/) 1.4.1 turns the sheets into images.
- **PDF**: [jsPDF](https://github.com/parallax/jsPDF) 2.5.1. PDFs contain a high-resolution image of the sheet.
- **Reading files (Table Maker)**: [mammoth.js](https://github.com/mwilliamson/mammoth.js) 1.6.0 for Word and [PDF.js](https://mozilla.github.io/pdf.js/) 3.11 for PDF.
- **Fonts**: Google Fonts [Outfit](https://fonts.google.com/specimen/Outfit) and [Inter](https://fonts.google.com/specimen/Inter).

---

## 📂 Project Structure

```text
ResultMaker/
├── index.html                  # Result Maker and Central Ranking: markup, styles and scripts
├── tablemaker/
│   ├── index.html              # Table Maker page (loaded in a frame by index.html)
│   └── answer-parser.js        # Reads answers from solve sheet text and runs the checks
├── LICENSE                     # MIT License
└── README.md
```

---

## 🤝 Contributing

Suggestions and pull requests are welcome.

1. Fork the project (`https://github.com/nafissami19/ResultMaker/fork`)
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made for students, teachers and coaching centres.
</p>
