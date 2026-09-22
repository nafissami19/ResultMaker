# 🦅 Phoenix Result Maker

> Generates single-page printable weekly result sheets, provides centralized cross-batch rankings, and exports high-fidelity PDF, PNG, and CSV reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern_Flexbox_%26_Grid-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Responsive](https://img.shields.io/badge/Layout-A4_Landscape_Print_Ready-success)]()
[![Platform](https://img.shields.io/badge/Platform-Web-lightgrey)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots & UI Preview](#-screenshots--ui-preview)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
  - [1. Data Entry & Spreadsheet Import](#1-data-entry--spreadsheet-import)
  - [2. Result Sheet Customization](#2-result-sheet-customization)
  - [3. Exporting Results](#3-exporting-results)
  - [4. Central Ranking Management](#4-central-ranking-management)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Phoenix Result Maker** is an institutional-grade result management tool engineered for competitive admission coaching centers. Built specifically around the testing criteria of **North South University (NSU)** and **BRAC University (BRACU)** admission tests, it solves the challenge of formatting, grading, ranking, and printing exam results across mixed-curriculum batches on a single page.

Everything operates **entirely client-side** in the browser—fast, private, and requiring zero server or database setup.

---

## ✨ Key Features

### 📄 1. Single-Page Weekly Result Sheet Generator
- **Dual-Batch Side-by-Side View**: Compares NSU Standard and BRACU Standard test-takers side by side.
- **Smart Adaptive Sizing**: Automatically adjusts cell padding, font size, and name column widths so sheets containing up to **35+ students** consistently fit onto a **single A4 landscape page** without overflowing.
- **Side-by-Side Split for Large Single Batches**: When only one batch is selected and has over 15 students, the sheet automatically splits the list into two balanced columns to maximize readability.
- **Royal Academic Modern Aesthetic**: Obsidian-navy table headers, celestial-blue cumulative total columns, and radiant Olympic medal badges (🥇 1st, 🥈 2nd, 🥉 3rd).

### 🎯 2. Specialized NSU & BRACU Exam Intelligence
- **Distinct Curriculum Support**: Handles varying section structures between universities without manual reconfiguration.
- **Automated BRACU Classification**: Students who attempt **Section 05** or **Section 06** are automatically recognized as BRACU candidates.
- **Strict 4-Section Layout for NSU**: Ensures NSU result columns strictly display `S01`, `S02`, `S03`, and `Essay`.
- **Zero-Mark Formatting**: Scores of `0` are styled as clean, professional hyphens (`-`) rather than distracting zeros.

### 🏆 3. Central Multi-Test Ranking Dashboard
- **Cross-Batch Aggregation**: Aggregates Model Tests 1 through 5 across multiple batches.
- **Dynamic Filters**: Instant toggle between **Top 30 Merit Rankers** and **All Students**, with batch-specific dropdown filters.
- **Pagination & Sorting**: Paginated navigation with instant sorting by total marks.

### ⚡ 4. Productivity & Workflow Tools
- **Live Search / Filter**: Instant keyword search in the student entry table with real-time match counters.
- **Spreadsheet Bulk Import**: One-click Tab-separated or Comma-separated paste directly from **Google Sheets** or **Microsoft Excel**.
- **Form Config Auto-Save**: Automatically stores batch headers, dates, exam titles, and display preferences in `localStorage` so refreshing never loses your work.
- **🌓 Dark / Light Mode Switcher**: Seamlessly toggle between light and dark UI themes with persistent user preference.
- **Multi-Format Export**:
  - 📥 **PDF Export**: Pixel-perfect vector PDF generation (`jsPDF` / `html2pdf.js`).
  - 🖼️ **Image Export**: Ultra-crisp PNG capture (`html2canvas`).
  - 📊 **CSV Export**: Clean spreadsheet export with quoted string escaping.

---

## 🚀 Getting Started

Because Result Maker is a zero-dependency static web application, you can run it immediately without complex installation.

### Option 1: Direct File Launch
Simply clone or download the repository, then double-click `index.html` to open it in Google Chrome, Microsoft Edge, or Mozilla Firefox:
```bash
git clone https://github.com/nafissami19/ResultMaker.git
cd ResultMaker
# Open index.html in your default browser
```

### Option 2: Local HTTP Server (Recommended)
Running through a lightweight local server ensures full compatibility with iframe sub-modules and canvas exports:

**Using Python:**
```bash
python -m http.server 3000
# Open http://localhost:3000 in your browser
```

**Using Node.js:**
```bash
npx serve .
# Or
npx http-server -p 3000
```

---

## 📖 How to Use

### 1. Data Entry & Spreadsheet Import
1. Click **"Import from Spreadsheet"** on the dashboard.
2. Select your target standard (`NSU`, `BRACU`, or `Both (Auto Detect)`).
3. Copy rows from your Excel sheet or Google Sheet and paste them into the box:
   ```tsv
   Name                 S01    S02    S03    Essay    S05    S06
   John Doe             14     22     10     10       4      4
   Jane Smith           11     18     9      9        -      -
   ```
4. Click **"Process Import"**. Students will automatically populate the entry table.

### 2. Result Sheet Customization
- **Batch Header**: Enter the batch identifier (e.g. `BATCH 87`, `OFFLINE COMBO`).
- **Middle Header**: Main institutional masthead (defaults to `PHOENIX EDUCATION`).
- **Test Title**: Name of the test (e.g. `Weekly Model Test 04`).
- **Date**: Exam date (formats automatically to `Month Day, Year`).
- **Toggles**: Enable/disable headers, batch titles, or hide zero-mark students.

### 3. Exporting Results
- Click **"Download PDF"** to generate an official vector A4 result sheet.
- Click **"Download Image"** for a high-res PNG image suitable for social media sharing.
- Click **"Export CSV"** to save student scores to a `.csv` file.

### 4. Central Ranking Management
1. Switch to the **Central Ranking** tab from the top navigation bar.
2. Click **"Import Batch Data"** to load comprehensive model test scores.
3. Use the **Batch Filter** to view single-batch standings or combined rankings.
4. Export Central Ranking data directly via **"Export CSV"** or **"Download PDF"**.

---

## 🛠️ Technical Stack

- **Core**: Vanilla HTML5, Modern CSS3 (Custom Variables, Flexbox, Grid), ES6+ JavaScript.
- **Canvas & Rendering Engine**: [html2canvas](https://html2canvas.hertzen.com/) (v1.4.1) for DOM-to-canvas rendering.
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) (v2.5.1) and [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (v0.10.1).
- **Typography**: Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit) & [Inter](https://fonts.google.com/specimen/Inter)).
- **Storage**: Browser `localStorage` for offline persistence and zero-config deployment.

---

## 📂 Project Structure

```text
ResultMaker/
├── index.html                   # Main application entry point & unified UI
├── css/
│   └── style.css                # Modular stylesheet definitions
├── js/
│   ├── app.js                   # Application controller & view router
│   ├── storage.js               # LocalStorage database helper
│   └── ui.js                    # UI render components
├── tablemaker/                  # Modular iframe table builder component
│   ├── index.html
│   └── assets/
├── .gitignore                   # Standard git ignore file
├── LICENSE                      # MIT Open Source License
└── README.md                    # Project documentation
```

---

## 🤝 Contributing

Contributions, feature suggestions, and pull requests are warmly welcomed!

1. Fork the Project (`https://github.com/nafissami19/ResultMaker/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with ❤️ for students, teachers, and educators.
</p>
