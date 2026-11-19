// ==========================================================
// Results & Evaluation Controller (Supabase + Local JSON Fallback)
// ==========================================================
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');
const { evaluateAnswer } = require('../services/nlpEvaluationService');

const DATA_FILE = path.join(__dirname, '../data/results.json');
const QUESTIONS_FILE = path.join(__dirname, '../data/questions.json');

function readLocalResults() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function writeLocalResults(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write local results:', e.message);
    }
}

function readLocalQuestions() {
    try {
        if (!fs.existsSync(QUESTIONS_FILE)) return [];
        const raw = fs.readFileSync(QUESTIONS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

// GET /api/results
exports.getAllResults = async (req, res) => {
    try {
        const { status, search, adminEmail, examCode } = req.query;
        let results = [];

        if (isConfigured()) {
            let query = supabase.from('results').select('*').order('id', { ascending: false });
            if (status) query = query.eq('status', status);
            if (adminEmail) query = query.eq('adminEmail', adminEmail);
            if (examCode) query = query.eq('examCode', examCode);

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                results = data;
            } else {
                results = readLocalResults();
            }
        } else {
            results = readLocalResults();
        }

        if (adminEmail) {
            const clean = adminEmail.trim().toLowerCase();
            results = results.filter(r => (r.adminEmail || 'admin@sies.ai').toLowerCase() === clean);
        }
        if (examCode) {
            const cleanCode = examCode.trim().toUpperCase();
            results = results.filter(r => (r.examCode || 'SIES-TECH').toUpperCase() === cleanCode);
        }
        if (status) {
            results = results.filter(r => r.status === status);
        }
        if (search) {
            const s = search.toLowerCase();
            results = results.filter(r =>
                (r.name || '').toLowerCase().includes(s) ||
                (r.email || '').toLowerCase().includes(s)
            );
        }

        return res.json({ success: true, count: results.length, data: results });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/results/:id
exports.getResultById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const results = readLocalResults();
        const found = results.find(r => r.id === id);

        if (!found) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        return res.json({ success: true, data: found });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/results/evaluate
// Candidate submits interview session answers to backend for NLP scoring
exports.submitEvaluation = async (req, res) => {
    try {
        const { candidateName, candidateEmail, answers, adminEmail, examCode } = req.body;

        if (!candidateName || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'candidateName and answers array are required.'
            });
        }

        const questions = readLocalQuestions();
        const questionResults = [];

        let totalScore = 0;
        let technicalScore = 0;
        let techCount = 0;
        let hrScore = 0;
        let hrCount = 0;
        let commScoreSum = 0;

        answers.forEach(item => {
            const questionObj = questions.find(q => q.id === item.questionId) || {
                question: item.question || 'Interview Question',
                category: item.category || 'Technical',
                type: item.type || 'General'
            };

            const evalResult = evaluateAnswer(item.answer, questionObj);

            questionResults.push({
                questionId: item.questionId,
                question: questionObj.question,
                category: questionObj.category,
                answer: item.answer,
                score: evalResult.score,
                feedback: evalResult.feedback,
                keywordsFound: evalResult.keywordsFound
            });

            totalScore += evalResult.score;
            commScoreSum += evalResult.commScore;

            if (questionObj.category === 'Technical') {
                technicalScore += evalResult.score;
                techCount++;
            } else {
                hrScore += evalResult.score;
                hrCount++;
            }
        });

        const numAnswers = answers.length || 1;
        const overall = Math.round(totalScore / numAnswers);
        const techAvg = techCount ? Math.round(technicalScore / techCount) : 0;
        const hrAvg = hrCount ? Math.round(hrScore / hrCount) : 0;
        const commAvg = Math.round(commScoreSum / numAnswers);

        const status = overall >= 70 ? 'Passed' : overall >= 50 ? 'Review' : 'Failed';

        const newResult = {
            id: Date.now(),
            name: candidateName.trim(),
            email: (candidateEmail || 'candidate@example.com').trim().toLowerCase(),
            adminEmail: (adminEmail || 'admin@sies.ai').trim().toLowerCase(),
            examCode: (examCode || 'SIES-TECH').trim().toUpperCase(),
            date: new Date().toISOString().split('T')[0],
            overallScore: overall,
            technical: techAvg,
            hr: hrAvg,
            communication: commAvg,
            status,
            questionResults
        };

        if (isConfigured()) {
            try {
                const { data, error } = await supabase.from('results').insert([newResult]).select();
                if (!error && data && data[0]) {
                    newResult.id = data[0].id;
                }
            } catch (e) {
                console.warn('[Supabase Insert Error]:', e.message);
            }
        }

        const local = readLocalResults();
        local.unshift(newResult);
        writeLocalResults(local);

        return res.status(201).json({
            success: true,
            data: newResult
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/results/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const results = readLocalResults();
        const questions = readLocalQuestions();

        const totalInterviews = results.length;
        const avgScore = totalInterviews
            ? Math.round(results.reduce((s, r) => s + (Number(r.overallScore) || 0), 0) / totalInterviews)
            : 0;

        const passedCount = results.filter(r => r.status === 'Passed').length;
        const passRate = totalInterviews ? Math.round((passedCount / totalInterviews) * 100) : 0;

        const techCount = questions.filter(q => q.category === 'Technical').length;
        const hrCount = questions.filter(q => q.category === 'HR').length;

        const topCandidate = [...results].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0] || null;

        return res.json({
            success: true,
            data: {
                totalInterviews,
                avgScore,
                passRate,
                totalQuestions: questions.length,
                categoryDistribution: {
                    technical: techCount,
                    hr: hrCount
                },
                topCandidate
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
