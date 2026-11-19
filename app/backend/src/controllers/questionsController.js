// ==========================================================
// Questions Controller (Supabase + Local JSON Fallback)
// ==========================================================
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');

const DATA_FILE = path.join(__dirname, '../data/questions.json');

function readLocalQuestions() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function writeLocalQuestions(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write local questions:', e.message);
    }
}

// GET /api/questions
exports.getAllQuestions = async (req, res) => {
    try {
        const { category, difficulty, search, adminEmail } = req.query;

        let questions = [];

        if (isConfigured()) {
            let query = supabase.from('questions').select('*').order('id', { ascending: true });
            if (category) query = query.eq('category', category);
            if (difficulty) query = query.eq('difficulty', difficulty);
            if (adminEmail) query = query.eq('adminEmail', adminEmail);

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                questions = data;
            } else {
                questions = readLocalQuestions();
            }
        } else {
            questions = readLocalQuestions();
        }

        if (adminEmail) {
            const clean = adminEmail.trim().toLowerCase();
            questions = questions.filter(q => (q.adminEmail || 'admin@sies.ai').toLowerCase() === clean);
        }
        if (category) {
            questions = questions.filter(q => q.category === category);
        }
        if (difficulty) {
            questions = questions.filter(q => q.difficulty === difficulty);
        }
        if (search) {
            const s = search.toLowerCase();
            questions = questions.filter(q =>
                (q.question || '').toLowerCase().includes(s) ||
                (q.type || '').toLowerCase().includes(s)
            );
        }

        return res.json({ success: true, count: questions.length, data: questions });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/questions/:id
exports.getQuestionById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const questions = readLocalQuestions();
        const found = questions.find(q => q.id === id);

        if (!found) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        return res.json({ success: true, data: found });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/questions
exports.createQuestion = async (req, res) => {
    try {
        const { question, category, type, difficulty, points, adminEmail, options, correctAnswer } = req.body;

        if (!question || !category || !type) {
            return res.status(400).json({ success: false, message: 'Question text, category, and type are required.' });
        }

        const newQuestion = {
            id: Date.now(),
            question: question.trim(),
            category: category.trim(),
            type: type.trim(),
            difficulty: difficulty || 'Medium',
            points: Number(points) || 10,
            options: Array.isArray(options) ? options : [],
            correctAnswer: (typeof correctAnswer === 'number') ? correctAnswer : parseInt(correctAnswer || 0),
            adminEmail: adminEmail || 'admin@sies.ai',
            created_at: new Date().toISOString()
        };

        if (isConfigured()) {
            try {
                const { data, error } = await supabase.from('questions').insert([newQuestion]).select();
                if (!error && data && data[0]) {
                    newQuestion.id = data[0].id;
                }
            } catch (e) {
                console.warn('[Supabase Insert Error, saved locally]:', e.message);
            }
        }

        const local = readLocalQuestions();
        local.push(newQuestion);
        writeLocalQuestions(local);

        return res.status(201).json({ success: true, data: newQuestion });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/questions/:id
exports.updateQuestion = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const local = readLocalQuestions();
        const idx = local.findIndex(q => q.id === id);

        if (idx === -1) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const updated = { ...local[idx], ...req.body, id };
        local[idx] = updated;
        writeLocalQuestions(local);

        if (isConfigured()) {
            try {
                const { id: _, ...fields } = req.body;
                await supabase.from('questions').update(fields).eq('id', id);
            } catch (e) {
                console.warn('[Supabase Update Error]:', e.message);
            }
        }

        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const local = readLocalQuestions();
        const filtered = local.filter(q => q.id !== id);

        if (local.length === filtered.length) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        writeLocalQuestions(filtered);

        if (isConfigured()) {
            try {
                await supabase.from('questions').delete().eq('id', id);
            } catch (e) {
                console.warn('[Supabase Delete Error]:', e.message);
            }
        }

        return res.json({ success: true, message: 'Question deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
