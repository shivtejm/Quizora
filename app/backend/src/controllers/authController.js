// ==========================================================
// Authentication Controller (Supabase + Local Fallback)
// ==========================================================
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');

const USERS_FILE = path.join(__dirname, '../data/users.json');

function readLocalUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function writeLocalUsers(data) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write local users:', e.message);
    }
}

function generateExamCode(name, existingCodes = []) {
    const clean = (name || 'QUIZ').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'QUIZ';
    let code = '';
    let attempts = 0;
    do {
        const num = Math.floor(1000 + Math.random() * 9000);
        code = `${clean}-${num}`;
        attempts++;
    } while (attempts < 100 && existingCodes.includes(code.toUpperCase()));
    return code;
}

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, examCode, customExamCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const userRole = role === 'candidate' || role === 'student' ? 'candidate' : 'admin';
        const rawCode = examCode || customExamCode;

        // Check if user already exists in local or Supabase
        const localUsers = readLocalUsers();
        if (localUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
            return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please Sign In.' });
        }

        let finalExamCode = null;
        if (userRole === 'admin') {
            const existingCodes = localUsers.map(u => (u.exam_code || u.examCode || '').toUpperCase()).filter(Boolean);

            if (rawCode && rawCode.trim()) {
                finalExamCode = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

                // 1. Check local users
                const codeInLocal = localUsers.find(u => (u.exam_code || u.examCode || '').toUpperCase() === finalExamCode && u.email.toLowerCase() !== cleanEmail);
                if (codeInLocal) {
                    return res.status(409).json({
                        success: false,
                        message: `The Exam Access Code "${finalExamCode}" is already in use by another instructor. Each instructor must have a unique exam code.`
                    });
                }

                // 2. Check Supabase users if configured
                if (isConfigured()) {
                    try {
                        const { data: existingCodeUsers } = await supabase
                            .from('users')
                            .select('id, email, exam_code')
                            .ilike('exam_code', finalExamCode);
                        if (existingCodeUsers && existingCodeUsers.length > 0 && existingCodeUsers.some(u => (u.email || '').toLowerCase() !== cleanEmail)) {
                            return res.status(409).json({
                                success: false,
                                message: `The Exam Access Code "${finalExamCode}" is already in use by another instructor. Each instructor must have a unique exam code.`
                            });
                        }
                    } catch (err) {
                        console.warn('[Supabase duplicate code check error]:', err.message);
                    }
                }
            } else {
                finalExamCode = generateExamCode(name, existingCodes);
            }
        }

        let newUser = {
            id: Date.now(),
            name: name.trim(),
            email: cleanEmail,
            password: password,
            role: userRole,
            exam_code: finalExamCode,
            examCode: finalExamCode,
            created_at: new Date().toISOString()
        };

        if (isConfigured()) {
            try {
                const { data, error } = await supabase.from('users').insert([{
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    exam_code: newUser.exam_code
                }]).select();

                if (!error && data && data[0]) {
                    newUser.id = data[0].id;
                }
            } catch (err) {
                console.warn('[Supabase Users Insert Error, saved locally]:', err.message);
            }
        }

        localUsers.push(newUser);
        writeLocalUsers(localUsers);

        return res.status(201).json({
            success: true,
            token: `sies_token_${Date.now()}`,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                examCode: newUser.examCode || newUser.exam_code
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        let foundUser = null;

        // 1. Try Supabase
        if (isConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', cleanEmail)
                    .eq('password', password)
                    .maybeSingle();

                if (!error && data) {
                    foundUser = data;
                }
            } catch (err) {
                console.warn('[Supabase Auth check failed, using local store]:', err.message);
            }
        }

        // 2. Try Local fallback
        if (!foundUser) {
            const localUsers = readLocalUsers();
            foundUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
        }

        if (!foundUser) {
            return res.status(401).json({ success: false, message: 'Invalid email or password. Please verify your credentials or create an account.' });
        }

        return res.json({
            success: true,
            token: `sies_token_${Date.now()}`,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
                examCode: foundUser.exam_code || foundUser.examCode
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/exam/:code
exports.verifyExamCode = async (req, res) => {
    try {
        const code = (req.params.code || '').trim().toUpperCase();
        if (!code) {
            return res.status(400).json({ success: false, message: 'Exam code is required.' });
        }

        let adminUser = null;

        if (isConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, email, exam_code')
                    .eq('exam_code', code)
                    .maybeSingle();

                if (!error && data) adminUser = data;
            } catch (err) {}
        }

        if (!adminUser) {
            const localUsers = readLocalUsers();
            adminUser = localUsers.find(u => (u.exam_code || u.examCode || '').toUpperCase() === code);
        }

        if (!adminUser) {
            return res.status(404).json({ success: false, message: `Exam code "${code}" not found.` });
        }

        return res.json({
            success: true,
            exam: {
                adminName: adminUser.name,
                adminEmail: adminUser.email,
                examCode: adminUser.exam_code || adminUser.examCode
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.me = async (req, res) => {
    return res.json({ success: true, message: 'Active session' });
};
