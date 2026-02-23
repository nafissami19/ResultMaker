const UI = {
    renderDashboard() {
        const students = Storage.getStudents();
        const tests = Storage.getTests();
        const nsuCount = students.filter(s => s.standard === 'NSU').length;
        const bracuCount = students.filter(s => s.standard === 'BRACU').length;

        return `
            <div class="dashboard-banner" style="margin-bottom: 2rem; border-radius: var(--radius-lg); overflow: hidden; height: 200px; position: relative; border: 1px solid var(--border);">
                <img src="phoenix_education_banner.png" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
                <div style="position: absolute; bottom: 2rem; left: 2rem;">
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Welcome back, Admin</h2>
                    <p style="color: var(--text-muted)">Manage your student's results with precision and style.</p>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total Students</div>
                    <div class="stat-value">${students.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">NSU Standard</div>
                    <div class="stat-value">${nsuCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">BRACU Standard</div>
                    <div class="stat-value">${bracuCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Total Tests</div>
                    <div class="stat-value">${tests.length}</div>
                </div>
            </div>
            
            <section class="recent-activity">
                <h2 style="margin-bottom: 1.5rem">Recent Tests</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Test Title</th>
                                <th>Date</th>
                                <th>Batch</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tests.slice(0, 5).map(test => `
                                <tr>
                                    <td>${test.title}</td>
                                    <td>${test.date}</td>
                                    <td>${test.batch}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="app.navigateTo('results', {testId: ${test.id}})">View Results</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    },

    renderStudents() {
        const students = Storage.getStudents();
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2rem">
                <h2>All Students</h2>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end">
                    <button class="btn btn-secondary btn-sm" onclick="app.showBulkNamesModal()">Bulk Add Names</button>
                    <button class="btn btn-secondary btn-sm" onclick="app.showSpreadsheetImportModal()">Import Spreadsheet</button>
                    <button class="btn btn-secondary btn-sm" onclick="app.exportStudents()">Export CSV</button>
                    <button class="btn btn-primary btn-sm" onclick="app.showAddStudentModal()">Add Student</button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Standard</th>
                            <th>Batch</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td>${s.name}</td>
                                <td><span class="badge badge-${s.standard.toLowerCase()}">${s.standard}</span></td>
                                <td>${s.batch}</td>
                                <td>
                                    <button class="btn btn-icon btn-sm" onclick="app.deleteStudent(${s.id})">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderResults(testId) {
        const test = Storage.getTests().find(t => t.id == testId);
        if (!test) return 'Test not found';

        const students = Storage.getStudents();
        const allResults = Storage.getResultsForTest(testId);

        // Process results for ranking
        const processResultsByStandard = (standard) => {
            const filteredStudents = students.filter(s => s.standard === standard);
            const ranked = filteredStudents.map(s => {
                const res = allResults.find(r => r.studentId === s.id) || { scores: {} };
                const total = Object.values(res.scores).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                return { ...s, ...res, total };
            })
                .filter(r => r.total > 0 || r.id in allResults.map(ar => ar.studentId)) // Only those who participated
                .sort((a, b) => b.total - a.total);

            // Assign ranks
            ranked.forEach((r, i) => {
                r.rankNum = i + 1;
                r.rankText = (i + 1) + (i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th');
            });

            return ranked;
        };

        const nsuRanked = processResultsByStandard('NSU');
        const bracuRanked = processResultsByStandard('BRACU');

        return `
            <div class="results-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem">
                <div>
                    <h2>${test.title} - Results</h2>
                    <p style="color: var(--text-muted)">Published: ${test.date}</p>
                </div>
                <div style="display: flex; gap: 12px">
                    <button class="btn btn-secondary" onclick="app.showEnterMarksModal(${testId})">Enter Marks</button>
                    <button class="btn btn-primary" onclick="window.print()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print PDF
                    </button>
                </div>
            </div>

            <div class="results-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- NSU Table -->
                <div class="result-group">
                    <h3 class="group-title" style="text-align: center; margin-bottom: 1rem; font-size: 1.5rem">NSU Standard</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Names</th>
                                    ${test.subjects.filter(s => s !== 'S05' && s !== 'S06').map(s => `<th>${s}</th>`).join('')}
                                    <th>Total</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${nsuRanked.map(r => `
                                    <tr>
                                        <td>${r.name}</td>
                                        ${test.subjects.filter(s => s !== 'S05' && s !== 'S06').map(s => `<td>${r.scores[s] || '-'}</td>`).join('')}
                                        <td style="font-weight: 700; color: var(--primary)">${r.total}</td>
                                        <td>${r.rankText}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- BRACU Table -->
                <div class="result-group">
                    <h3 class="group-title" style="text-align: center; margin-bottom: 1rem; font-size: 1.5rem">BRACU Standard</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Names</th>
                                    ${test.subjects.map(s => `<th>${s}</th>`).join('')}
                                    <th>Total</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bracuRanked.map(r => `
                                    <tr>
                                        <td>${r.name}</td>
                                        ${test.subjects.map(s => `<td>${r.scores[s] || '-'}</td>`).join('')}
                                        <td style="font-weight: 700; color: var(--primary)">${r.total}</td>
                                        <td>${r.rankText}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- This part only shows up during printing -->
            <div class="print-only">
                ${this.renderPrintVersions(test, nsuRanked, bracuRanked)}
            </div>
        `;
    },

    renderPrintVersions(test, nsuResults, bracuResults) {
        const renderSinglePrintPage = (standard, results) => {
            return `
                <div class="print-page" style="page-break-after: always; padding: 40px; color: black; background: white; font-family: 'Inter', sans-serif;">
                    <div class="print-header" style="display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
                        <span>BATCH 89</span>
                        <span style="font-weight: 800; font-size: 1.2rem">PHOENIX EDUCATION</span>
                        <span>NSU BRACU COMBO OFFLINE [2]</span>
                    </div>
                    
                    <h2 style="text-align: center; margin-bottom: 20px; text-decoration: underline;">${standard} Standard</h2>

                    <div class="print-table-wrapper">
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                            <thead>
                                <tr style="background: #2c3e50; color: white;">
                                    <th style="border: 1px solid black; padding: 8px;">Names</th>
                                    ${test.subjects.filter(subj => !(standard === 'NSU' && (subj === 'S05' || subj === 'S06'))).map(s => `<th style="border: 1px solid black; padding: 8px;">${s}</th>`).join('')}
                                    <th style="border: 1px solid black; padding: 8px;">Total</th>
                                    <th style="border: 1px solid black; padding: 8px;">Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.map(r => `
                                    <tr>
                                        <td style="border: 1px solid black; padding: 8px;">${r.name}</td>
                                        ${test.subjects.filter(subj => !(standard === 'NSU' && (subj === 'S05' || subj === 'S06'))).map(s => `<td style="border: 1px solid black; padding: 8px; text-align: center;">${r.scores[s] || '0'}</td>`).join('')}
                                        <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${r.total}</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: center;">${r.rankText}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="print-footer" style="display: flex; justify-content: space-between; border-top: 1px solid black; padding-top: 10px; margin-top: 40px; font-size: 0.9rem;">
                        <span>Result Published: ${new Date(test.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>${test.title} - Result Sheet</span>
                    </div>
                </div>
            `;
        };

        return `
            ${renderSinglePrintPage('NSU', nsuResults)}
            ${renderSinglePrintPage('BRACU', bracuResults)}
        `;
    }
};
