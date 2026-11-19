/*
 * Answer key parser for Phoenix solve sheets (.docx / .pdf / pasted text).
 *
 * How it works
 *  1. The text is split into lines. If a "Solve Sheet" / "Answer Key" / "Solution" heading
 *     exists, everything before it is the question paper and everything after it the solutions.
 *  2. The solutions are split into sections at headings like "Section 1: …", "Section A – […]".
 *  3. In each section, answers are read from two places:
 *       - key lines:          "01. B", "01. B 02. A 03. D" (table rows), "1) c"
 *       - explanation lines:  "01. (B) Because …"
 *     Key answers win; explanations fill gaps and are used to cross-check the key.
 *  4. The question paper is scanned per section for the highest question number, so we can
 *     warn when the solve sheet is missing answers.
 *
 * Exposes window.AnswerParser = { parse(text) } (also works as a CommonJS module for tests).
 */
(function (root) {
    'use strict';

    const LETTERS = 'ABCDE';

    // "Section 01 – English Grammar", "SECTION C – [Quantitative Aptitude]", "Section F– [Biology]"
    const SECTION_RE = /^\s*section\s*[-–—:]?\s*([0-9]{1,2}|[A-Ha-h])\b\s*[-–—:.)]*\s*(.*)$/i;
    const SOLVE_RE = /^\s*(solve\s*sheet|answer\s*key|answer\s*sheet|solutions?)\b/i;
    // One key token: "01. B", "1) c", "12 - D", "05.(A)"
    const KEY_TOKEN = /(\d{1,3})\s*[.):-]?\s*\(?([A-Ea-e])\)?(?![A-Za-z])/g;
    const KEY_LINE = /^(?:\s*\d{1,3}\s*[.):-]?\s*\(?[A-Ea-e]\)?(?![A-Za-z])[\s|,;]*)+$/;
    // Explanation: "01. (B) text", "1.(c)", "07. (A)\ttext"
    const EXPLAIN_RE = /^\s*(\d{1,3})\s*[.)]\s*\(([A-Ea-e])\)/;
    // Question in the paper: "01.\tHad we known…", "17. ", "1." (table cell)
    const QUESTION_RE = /^\s*(\d{1,3})\s*[.)](?:\s|$)/;

    function cleanTitle(raw) {
        return String(raw || '')
            .replace(/[\[\]{}]/g, '')
            .replace(/\btime\s*:.*$/i, '')
            .replace(/\s*[-–—:]\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function sectionId(token) {
        const t = String(token).trim().toUpperCase();
        return /^\d+$/.test(t) ? String(parseInt(t, 10)) : t;
    }

    function formatSectionName(id, title) {
        const label = /^\d+$/.test(id) ? id.padStart(2, '0') : id;
        return title ? `Section ${label} – ${title}` : `Section ${label}`;
    }

    function splitLines(text) {
        return String(text || '')
            .replace(/\r\n?/g, '\n')
            .replace(/ /g, ' ')
            .split('\n')
            .map(l => l.replace(/[\t ]+/g, ' ').trim())
            .filter(l => l.length > 0);
    }

    // Group lines into sections. Lines before the first heading go into a default section.
    function splitSections(lines) {
        const sections = [];
        let current = null;
        for (const line of lines) {
            const m = line.match(SECTION_RE);
            // A heading line is short-ish; long sentences that start with "Section" are text
            if (m && line.length < 90) {
                current = { id: sectionId(m[1]), title: cleanTitle(m[2]), lines: [] };
                sections.push(current);
                continue;
            }
            if (!current) {
                current = { id: '', title: '', lines: [] };
                sections.push(current);
            }
            current.lines.push(line);
        }
        return sections.filter(s => s.id || s.lines.length);
    }

    function readAnswers(lines) {
        const key = new Map();      // number -> letter from key tables
        const explained = new Map(); // number -> letter from explanations
        const duplicates = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const ex = line.match(EXPLAIN_RE);
            if (ex) {
                const n = parseInt(ex[1], 10);
                if (!explained.has(n)) explained.set(n, ex[2].toUpperCase());
                continue;
            }

            if (KEY_LINE.test(line)) {
                for (const t of line.matchAll(KEY_TOKEN)) {
                    const n = parseInt(t[1], 10);
                    const letter = t[2].toUpperCase();
                    if (key.has(n) && key.get(n) !== letter) duplicates.push(n);
                    if (!key.has(n)) key.set(n, letter);
                }
                continue;
            }

            // Table cells split over two lines: "01." then "B"
            const numOnly = line.match(/^(\d{1,3})\s*[.)]?$/);
            if (numOnly && i + 1 < lines.length && /^\(?[A-Ea-e]\)?$/.test(lines[i + 1])) {
                const n = parseInt(numOnly[1], 10);
                if (!key.has(n)) key.set(n, lines[i + 1].replace(/[()]/g, '').toUpperCase());
                i++;
            }
        }
        return { key, explained, duplicates };
    }

    function highestQuestionNumber(lines) {
        let max = 0;
        for (const line of lines) {
            const m = line.match(QUESTION_RE);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n <= 200 && n > max) max = n;
            }
        }
        return max;
    }

    function findExamTitle(lines) {
        const t = lines.slice(0, 8).find(l => /(model\s*test|mock|exam|test\s*\d|fmt)/i.test(l) && l.length < 80);
        return t ? cleanTitle(t) : '';
    }

    function parse(text) {
        const lines = splitLines(text);
        const solveIdx = lines.findIndex(l => SOLVE_RE.test(l) && l.length < 60);
        const paperLines = solveIdx > 0 ? lines.slice(0, solveIdx) : [];
        const answerLines = solveIdx >= 0 ? lines.slice(solveIdx + 1) : lines;

        const result = {
            examTitle: findExamTitle(lines),
            solveTitle: solveIdx >= 0 ? cleanTitle(lines[solveIdx]) : '',
            sections: [],
            notes: []      // { level: 'ok' | 'info' | 'warn' | 'error', text }
        };

        // Expected question counts from the question paper, per section id
        const expected = new Map();
        const paperTitles = new Map();
        for (const s of splitSections(paperLines)) {
            if (!s.id) continue;
            expected.set(s.id, highestQuestionNumber(s.lines));
            if (s.title) paperTitles.set(s.id, s.title);
        }

        let unnamed = 0;
        for (const s of splitSections(answerLines)) {
            const { key, explained, duplicates } = readAnswers(s.lines);
            const id = s.id || String(++unnamed);
            const name = s.id ? formatSectionName(id, s.title || paperTitles.get(id) || '') : 'Answers';

            if (key.size === 0 && explained.size === 0) {
                if (s.id) result.notes.push({ level: 'info', text: `${name}: no multiple-choice answers (written section), skipped.` });
                continue;
            }

            const numbers = new Set([...key.keys(), ...explained.keys()]);
            const max = Math.max(...numbers);
            const answers = [];
            const mismatches = [];
            for (let n = 1; n <= max; n++) {
                const k = key.get(n);
                const e = explained.get(n);
                if (k && e && k !== e) mismatches.push({ n, key: k, explanation: e });
                answers.push({ n, letter: k || e || '', source: k ? 'key' : (e ? 'explanation' : 'missing'), conflict: !!(k && e && k !== e) });
            }

            const section = { id, name, answers, expected: expected.get(id) || 0 };
            result.sections.push(section);

            // ── Checks ──
            const pad = n => String(n).padStart(2, '0');
            const missing = answers.filter(a => !a.letter).map(a => pad(a.n));
            if (key.size === 0) {
                result.notes.push({ level: 'info', text: `${name}: no answer table found, so the ${explained.size} answers were taken from the explanations.` });
            }
            if (mismatches.length) {
                result.notes.push({ level: 'error', text: `${name}: the answer table and the explanation disagree on ${mismatches.map(m => `${pad(m.n)} (table ${m.key}, explanation ${m.explanation})`).join(', ')}. The table answer is used; please check.` });
            }
            if (duplicates.length) {
                result.notes.push({ level: 'warn', text: `${name}: question ${[...new Set(duplicates)].map(pad).join(', ')} appears twice in the answer table with different answers.` });
            }
            if (missing.length) {
                result.notes.push({ level: 'warn', text: `${name}: no answer for ${missing.join(', ')}.` });
            }
            if (section.expected && section.expected > max) {
                result.notes.push({ level: 'warn', text: `${name}: the question paper goes up to ${pad(section.expected)}, but answers stop at ${pad(max)}.` });
            }
            if (!mismatches.length && !missing.length && (!section.expected || section.expected === max)) {
                const checkedBy = key.size && explained.size ? ', matches explanations' : '';
                const vsPaper = section.expected ? `, matches the question paper` : '';
                result.notes.push({ level: 'ok', text: `${name}: ${max} answers${checkedBy}${vsPaper}.` });
            }
        }

        if (!result.sections.length) {
            result.notes.push({ level: 'error', text: 'No answers found. The file should contain lines like "01. B" or "01. (B) explanation".' });
        }
        return result;
    }

    const api = { parse, splitLines, LETTERS };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.AnswerParser = api;
})(typeof window !== 'undefined' ? window : globalThis);
