const Storage = {
    DEFAULT_DATA: {
        students: [
            { id: 1, name: "MD. NAFIUL ISLAM", standard: "NSU", batch: "BATCH 89" },
            { id: 2, name: "Shak Sabbir Zaman", standard: "NSU", batch: "BATCH 89" },
            { id: 3, name: "Probourtona Saha Trisha", standard: "NSU", batch: "BATCH 89" },
            { id: 4, name: "Ramisha Anjum Noushin", standard: "NSU", batch: "BATCH 89" },
            { id: 5, name: "Nazifa Tasnim Islam", standard: "NSU", batch: "BATCH 89" },
            { id: 6, name: "Fuad Hasan Susmit", standard: "BRACU", batch: "BATCH 89" },
            { id: 7, name: "Nazmul Islam Tanim", standard: "BRACU", batch: "BATCH 89" },
        ],
        tests: [
            {
                id: 1,
                title: "Weekly Test 03 (WT03)",
                shortTitle: "WT03",
                date: "2026-02-23",
                batch: "BATCH 89",
                subjects: ["S01", "S02", "S03", "Essay", "S05"]
            },
            {
                id: 2,
                title: "Weekly Test 01 (WT01)",
                shortTitle: "WT01",
                date: "2026-02-09",
                batch: "BATCH 89",
                subjects: ["S01", "S02", "S03"]
            }
        ],
        results: [
            // Sample for WT03
            { testId: 1, studentId: 1, scores: { S01: 8, S02: 9, S03: 10, Essay: 16 } },
            { testId: 1, studentId: 2, scores: { S01: 12, S02: 9, S03: 10, Essay: 4.5 } },
            { testId: 1, studentId: 3, scores: { S01: 8, S02: 8, S03: 9, Essay: 4.5 } },
            { testId: 1, studentId: 4, scores: { S01: 11, S02: 5, S03: 8, Essay: 5 } },
            { testId: 1, studentId: 5, scores: { S01: 8, S02: 5, S03: 10, Essay: 4.5 } },
            { testId: 1, studentId: 6, scores: { S01: 13, S02: 12, S03: 10, Essay: 20, S05: 8 } },
            { testId: 1, studentId: 7, scores: { S01: 9, S02: 9, S03: 10, Essay: 20, S05: 8 } },
        ]
    },

    save(data) {
        localStorage.setItem('resultMaker_data', JSON.stringify(data));
    },

    load() {
        const data = localStorage.getItem('resultMaker_data');
        if (!data) {
            this.save(this.DEFAULT_DATA);
            return this.DEFAULT_DATA;
        }
        return JSON.parse(data);
    },

    getStudents() { return this.load().students; },
    getTests() { return this.load().tests; },
    getResults() { return this.load().results; },

    addStudent(student) {
        const data = this.load();
        student.id = Date.now();
        data.students.push(student);
        this.save(data);
        return student;
    },

    addTest(test) {
        const data = this.load();
        test.id = Date.now();
        data.tests.push(test);
        this.save(data);
        return test;
    },

    saveResult(result) {
        const data = this.load();
        const index = data.results.findIndex(r => r.testId === result.testId && r.studentId === result.studentId);
        if (index > -1) {
            data.results[index] = result;
        } else {
            data.results.push(result);
        }
        this.save(data);
    },

    getResultsForTest(testId) {
        return this.getResults().filter(r => r.testId == testId);
    },

    importBulkData(text) {
        const data = this.load();
        const lines = text.split('\n').filter(l => l.trim());
        
        lines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 1) {
                const name = parts[0].trim();
                const standard = parts[6] || 'NSU'; // Assuming 7th column might be type, or default
                const student = { id: Date.now() + Math.random(), name, standard, batch: 'BATCH 89' };
                data.students.push(student);
                
                // If there are marks
                if (parts.length > 1) {
                    const scores = {};
                    const subjects = ["S01", "S02", "S03", "Essay", "S05"];
                    subjects.forEach((subj, idx) => {
                        if (parts[idx + 1]) scores[subj] = parseFloat(parts[idx + 1]) || 0;
                    });
                    
                    // Create a dummy test if none exists or use a default
                    const testId = data.tests[0] ? data.tests[0].id : 1;
                    data.results.push({ testId, studentId: student.id, scores });
                }
            }
        });
        this.save(data);
    },

    exportToCSV() {
        const data = this.load();
        const students = data.students;
        const results = data.results;
        const testId = data.tests[0]?.id || 1;
        
        let csv = "Name,Standard,Batch,S01,S02,S03,Essay,S05\n";
        students.forEach(s => {
            const res = results.find(r => r.studentId === s.id && r.testId === testId) || { scores: {} };
            const row = [
                `"${s.name}"`,
                s.standard,
                s.batch,
                res.scores.S01 || 0,
                res.scores.S02 || 0,
                res.scores.S03 || 0,
                res.scores.Essay || 0,
                res.scores.S05 || 0
            ];
            csv += row.join(",") + "\n";
        });
        return csv;
    }
};
