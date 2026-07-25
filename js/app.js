const app = {
    currentPage: 'dashboard',
    pageParams: {},

    init() {
        this.bindEvents();
        this.navigateTo('dashboard');
        this.updateDate();
    },

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });


        document.querySelector('.btn-close').addEventListener('click', () => this.hideModal());
        document.querySelector('.btn-cancel').addEventListener('click', () => this.hideModal());
    },

    updateDate() {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
    },

    navigateTo(page, params = {}) {
        this.currentPage = page;
        this.pageParams = params;

        // Update Nav Active State
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update Title
        const titles = {
            dashboard: 'Dashboard',
            students: 'Students Management',
            tests: 'Tests & Results',
            results: 'Result View'
        };
        document.getElementById('page-title').textContent = titles[page] || 'ResultMaker';

        // Render Page
        const container = document.getElementById('page-container');
        container.classList.remove('fade-in');
        void container.offsetWidth; // Trigger reflow
        container.classList.add('fade-in');

        switch (page) {
            case 'dashboard':
                container.innerHTML = UI.renderDashboard();
                break;
            case 'students':
                container.innerHTML = UI.renderStudents();
                break;
            case 'tests':
                container.innerHTML = UI.renderTestsPage();
                break;
            case 'results':
                container.innerHTML = UI.renderResults(params.testId);
                break;
        }
    },

    // Modal Logic
    showModal(title, bodyHtml, onSave) {
        const modal = document.getElementById('modal-container');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;

        const saveBtn = modal.querySelector('.btn-save');
        // Remove old listeners
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', () => {
            if (onSave()) this.hideModal();
        });

        modal.classList.remove('hidden');
    },

    hideModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    showAddStudentModal() {
        const body = `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="std-name" placeholder="Enter student name">
            </div>
            <div class="form-group">
                <label>Standard</label>
                <select id="std-standard">
                    <option value="NSU">NSU Standard</option>
                    <option value="BRACU">BRACU Standard</option>
                </select>
            </div>
            <div class="form-group">
                <label>Batch</label>
                <input type="text" id="std-batch" value="BATCH 89">
            </div>
        `;

        this.showModal('Add New Student', body, () => {
            const name = document.getElementById('std-name').value;
            const standard = document.getElementById('std-standard').value;
            const batch = document.getElementById('std-batch').value;

            if (!name) return false;

            Storage.addStudent({ name, standard, batch });
            this.navigateTo('students');
            this.showToast('Student added successfully!');
            return true;
        });
    },

    showEnterMarksModal(testId) {
        const test = Storage.getTests().find(t => t.id == testId);
        const students = Storage.getStudents();
        const results = Storage.getResultsForTest(testId);

        let body = `<div class="marks-entry-list" style="display: flex; flex-direction: column; gap: 1rem;">`;

        students.forEach(s => {
            const res = results.find(r => r.studentId === s.id) || { scores: {} };
            body += `
                <div class="student-mark-row" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">${s.name} (${s.standard})</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 8px;">
                        ${test.subjects.map(subj => {
                if (s.standard === 'NSU' && (subj === 'S05' || subj === 'S06')) return '';
                return `
                                <div>
                                    <label style="font-size: 0.7rem;">${subj}</label>
                                    <input type="number" step="0.5" class="mark-input" data-student="${s.id}" data-subject="${subj}" value="${res.scores[subj] || ''}">
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        });
        body += `</div>`;

        this.showModal(`Enter Marks - ${test.shortTitle}`, body, () => {
            const rows = document.querySelectorAll('.student-mark-row');
            rows.forEach(row => {
                const studentId = parseInt(row.querySelector('.mark-input').dataset.student);
                const markInputs = row.querySelectorAll('.mark-input');
                const scores = {};
                markInputs.forEach(input => {
                    if (input.value) scores[input.dataset.subject] = parseFloat(input.value);
                });

                if (Object.keys(scores).length > 0) {
                    Storage.saveResult({ testId, studentId, scores });
                }
            });

            this.navigateTo('results', { testId });
            this.showToast('Marks saved successfully!');
            return true;
        });
    },

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            const data = Storage.load();
            data.students = data.students.filter(s => s.id !== id);
            Storage.save(data);
            this.navigateTo('students');
        }
    },


    showSpreadsheetImportModal() {
        const body = `
            <div class="form-group">
                <label>Paste Spreadsheet Data (Tab separated)</label>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Format: Name [Tab] S01 [Tab] S02 [Tab] S03 [Tab] Essay [Tab] S05</p>
                <textarea id="import-area" rows="10" placeholder="Paste here..."></textarea>
            </div>
        `;

        this.showModal('Import from Spreadsheet', body, () => {
            const text = document.getElementById('import-area').value;
            if (!text.trim()) return false;
            Storage.importBulkData(text);
            this.navigateTo('students');
            this.showToast('Spreadsheet data imported successfully!');
            return true;
        });
    },

    exportStudents() {
        const csv = Storage.exportToCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `resultmaker_export_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
        this.showToast('CSV exported successfully!');
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast fade-in';
        toast.style.cssText = `
            position: fixed; bottom: 2rem; right: 2rem;
            background: var(--success); color: white;
            padding: 12px 24px; border-radius: 8px;
            box-shadow: var(--shadow-lg); z-index: 2000;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Add missing method to UI
UI.renderTestsPage = function () {
    const tests = Storage.getTests();
    return `
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem">
            <h2>Manage Tests</h2>
            <button class="btn btn-primary" onclick="app.showAddTestModal()">Create New Test</button>
        </div>
        <div class="stats-grid">
            ${tests.map(test => `
                <div class="stat-card" style="cursor: pointer" onclick="app.navigateTo('results', {testId: ${test.id}})">
                    <div class="stat-title">${test.batch}</div>
                    <div class="stat-value" style="font-size: 1.4rem">${test.title}</div>
                    <div class="stat-trend" style="color: var(--text-muted)">
                        ${new Date(test.date).toLocaleDateString()}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

app.showAddTestModal = function () {
    const body = `
        <div class="form-group">
            <label>Test Title</label>
            <input type="text" id="test-title" placeholder="e.g. Weekly Test 04">
        </div>
        <div class="form-group">
            <label>Short Code</label>
            <input type="text" id="test-short" placeholder="e.g. WT04">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" id="test-date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
            <label>Subjects (Comma separated)</label>
            <input type="text" id="test-subjects" value="S01, S02, S03, Essay, S05">
        </div>
    `;

    this.showModal('Create New Test', body, () => {
        const title = document.getElementById('test-title').value;
        const shortTitle = document.getElementById('test-short').value;
        const date = document.getElementById('test-date').value;
        const subjects = document.getElementById('test-subjects').value.split(',').map(s => s.trim());

        if (!title || !shortTitle) return false;

        Storage.addTest({ title, shortTitle, date, subjects, batch: 'BATCH 89' });
        this.navigateTo('tests');
        return true;
    });
};

// Start the app
window.addEventListener('DOMContentLoaded', () => app.init());
