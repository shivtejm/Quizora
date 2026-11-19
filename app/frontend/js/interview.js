/* ===== Interview JS (Multi-Tenant Exam Code Aware) ===== */
let activeExam = null;
let interviewQuestions = [];
let currentIndex = 0;
let answers = [];
let timerInterval = null;
let timeLeft = 180; // 3 minutes per question
let candidateData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pre-fill name and email if logged in as candidate or regular user
    const user = localStorage.getItem('sies_user');
    const email = localStorage.getItem('sies_email');
    if (user && user !== 'candidate' && user !== 'Administrator' && user !== 'Admin') {
        const nameInput = document.getElementById('candidateName');
        if (nameInput) nameInput.value = user;
    }
    if (email && !email.includes('admin@sies.ai') && !email.includes('admin@quizora.com')) {
        const emailInput = document.getElementById('candidateEmail');
        if (emailInput) emailInput.value = email;
    }

    // 2. Check for URL exam code parameter (?code=...) or saved session code
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code') || localStorage.getItem('sies_examCode');
    const codeInput = document.getElementById('examAccessCode');
    const startBtn = document.getElementById('startExamBtn');

    // Initially disable start button until code is verified
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.4';
        startBtn.style.cursor = 'not-allowed';
    }

    if (codeParam) {
        if (codeInput) codeInput.value = codeParam.trim().toUpperCase();
        await validateExamCode(codeParam);
    }
});

let codeDebounceTimer = null;
function onExamCodeInput() {
    const input = document.getElementById('examAccessCode');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    input.value = code;

    clearTimeout(codeDebounceTimer);
    codeDebounceTimer = setTimeout(async () => {
        await validateExamCode(code);
    }, 250);
}

async function validateExamCode(code) {
    const banner = document.getElementById('examHostBanner');
    const icon = document.getElementById('examCodeStatusIcon');
    const totalQLabel = document.getElementById('totalQLabel');
    const startBtn = document.getElementById('startExamBtn');
    const codeInput = document.getElementById('examAccessCode');

    if (!code) {
        activeExam = null;
        if (banner) banner.style.display = 'none';
        if (icon) icon.style.display = 'none';
        if (totalQLabel) totalQLabel.textContent = '0 Questions';
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.4';
            startBtn.style.cursor = 'not-allowed';
        }
        return false;
    }

    let exam = typeof findExamByCode === 'function' ? await findExamByCode(code) : null;
    if (!exam && typeof getExamByCode === 'function') {
        exam = getExamByCode(code);
    }

    if (exam && exam.questions && exam.questions.length > 0) {
        activeExam = exam;
        if (codeInput) codeInput.style.borderColor = 'var(--accent-emerald)';
        if (banner) {
            banner.style.display = 'block';
            banner.style.background = 'rgba(34,211,238,0.1)';
            banner.style.border = '1px solid rgba(34,211,238,0.3)';
            banner.style.color = 'var(--text-primary)';
            banner.innerHTML = `<span style="color:var(--accent-cyan);font-weight:600;">✓ Verified Exam (${escapeHtml(exam.examCode)})</span> &bull; Examiner: <strong>${escapeHtml(exam.adminName)}</strong> (${escapeHtml(exam.adminEmail)}) &bull; <strong>${exam.questions.length}</strong> Questions Ready`;
        }
        if (icon) {
            icon.style.display = 'inline-block';
            icon.innerHTML = `<span style="color:var(--accent-emerald);font-weight:bold;font-size:1.1rem;">✓</span>`;
        }
        if (totalQLabel) {
            totalQLabel.textContent = `${exam.questions.length} Questions`;
        }
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
        }
        return true;
    } else {
        activeExam = null;
        if (codeInput) codeInput.style.borderColor = 'var(--accent-rose)';
        if (banner) {
            banner.style.display = 'block';
            banner.style.background = 'rgba(251,113,133,0.15)';
            banner.style.border = '1px solid rgba(251,113,133,0.4)';
            banner.style.color = 'var(--accent-rose)';
            banner.innerHTML = `<strong>❌ Invalid Exam Access Code "${escapeHtml(code)}"</strong><br>No examination found with this code. You cannot take the exam with a fake or unregistered code. Please check with your instructor.`;
        }
        if (icon) {
            icon.style.display = 'inline-block';
            icon.innerHTML = `<span style="color:var(--accent-rose);font-weight:bold;font-size:1.1rem;">✗</span>`;
        }
        if (totalQLabel) {
            totalQLabel.textContent = `0 Questions`;
        }
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.4';
            startBtn.style.cursor = 'not-allowed';
        }
        return false;
    }
}

async function startInterview() {
    const codeInput = document.getElementById('examAccessCode');
    const code = codeInput ? codeInput.value.trim().toUpperCase() : '';

    const isValid = await validateExamCode(code);
    if (!code || !isValid || !activeExam) {
        showToast('❌ Invalid Exam Access Code. You cannot start the exam with a fake code.', 'error');
        if (codeInput) {
            codeInput.style.borderColor = 'var(--accent-rose)';
            codeInput.focus();
        }
        return;
    }

    const name = document.getElementById('candidateName').value.trim();
    const email = document.getElementById('candidateEmail').value.trim();
    if (!name || !email) {
        showToast('Please enter your full name and email.', 'error');
        return;
    }

    candidateData = {
        name,
        email,
        examCode: activeExam.examCode,
        adminEmail: activeExam.adminEmail,
        adminName: activeExam.adminName
    };

    interviewQuestions = activeExam.questions;
    answers = new Array(interviewQuestions.length).fill('');
    currentIndex = 0;

    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('interviewScreen').style.display = 'block';
    document.getElementById('candidateInfo').textContent = `${name} • ${email}`;

    const hostTag = document.getElementById('activeExamHostTag');
    if (hostTag) {
        hostTag.textContent = `Exam: ${activeExam.examCode} • Examiner: ${activeExam.adminName}`;
    }

    loadQuestion();
    startTimer();
}

function loadQuestion() {
    if (!interviewQuestions || interviewQuestions.length === 0) return;
    const q = interviewQuestions[currentIndex];
    document.getElementById('questionText').textContent = q.question;

    const catClass = q.category === 'Technical' ? 'badge-info' : 'badge-violet';
    document.getElementById('qBadgeCategory').className = `badge ${catClass}`;
    document.getElementById('qBadgeCategory').textContent = q.category;

    const diffClass = q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger';
    document.getElementById('qBadgeDifficulty').className = `badge ${diffClass}`;
    document.getElementById('qBadgeDifficulty').textContent = q.difficulty;

    document.getElementById('qBadgePoints').textContent = (q.points || 10) + ' pts';

    // Render Multiple Choice Options
    const opts = q.options && q.options.length ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
    const selectedIdx = answers[currentIndex];
    const mcqList = document.getElementById('mcqOptionsList');

    if (mcqList) {
        mcqList.innerHTML = opts.map((optText, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
            const isSelected = selectedIdx !== undefined && selectedIdx !== '' && parseInt(selectedIdx) === idx;
            return `
                <div class="mcq-option-card ${isSelected ? 'selected' : ''}" onclick="selectOption(${idx})" id="mcqOpt_${idx}">
                    <div class="mcq-letter-badge">${letter}</div>
                    <div class="mcq-option-text">${escapeHtml(optText)}</div>
                </div>
            `;
        }).join('');
    }

    updateSelectionStatus();

    // Progress
    const total = interviewQuestions.length;
    const pct = Math.round(((currentIndex) / total) * 100);
    document.getElementById('progressLabel').textContent = `Question ${currentIndex + 1} of ${total}`;
    document.getElementById('progressPercent').textContent = pct + '%';
    document.getElementById('progressBar').style.width = pct + '%';

    // Nav buttons
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    const isLast = currentIndex === total - 1;
    document.getElementById('nextBtn').textContent = isLast ? 'Submit Exam ✓' : 'Next Question →';
    document.getElementById('nextBtn').className = isLast ? 'btn btn-success' : 'btn btn-primary';

    // Reset timer
    resetTimer();
}

function selectOption(idx) {
    answers[currentIndex] = idx;
    const cards = document.querySelectorAll('.mcq-option-card');
    cards.forEach((card, i) => {
        if (i === idx) card.classList.add('selected');
        else card.classList.remove('selected');
    });
    updateSelectionStatus();
}

function updateSelectionStatus() {
    const statusEl = document.getElementById('selectionStatus');
    if (!statusEl) return;
    const val = answers[currentIndex];
    if (val !== undefined && val !== '') {
        const letter = ['A', 'B', 'C', 'D'][parseInt(val)] || String(parseInt(val) + 1);
        statusEl.innerHTML = `Selected: <strong style="color:var(--accent-cyan);">Option ${letter}</strong>`;
    } else {
        statusEl.innerHTML = `<span style="color:var(--text-muted);">Please select one option to record your answer.</span>`;
    }
}

function nextQuestion() {
    if (currentIndex === interviewQuestions.length - 1) {
        submitInterview();
    } else {
        currentIndex++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        loadQuestion();
    }
}

function startTimer() {
    timeLeft = 180;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            if (currentIndex < interviewQuestions.length - 1) {
                currentIndex++;
                loadQuestion();
            } else {
                submitInterview();
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 180;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            if (currentIndex < interviewQuestions.length - 1) {
                currentIndex++;
                loadQuestion();
            } else {
                submitInterview();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const display = document.getElementById('timer');
    if (!display) return;
    display.innerHTML = `<svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}</span>`;

    display.classList.remove('warning', 'danger');
    if (timeLeft <= 30) display.classList.add('danger');
    else if (timeLeft <= 60) display.classList.add('warning');
}

function submitInterview() {
    clearInterval(timerInterval);

    // Score each Multiple Choice Answer
    let totalScore = 0;
    let technicalScore = 0, hrScore = 0, commScore = 0;
    let techCount = 0, hrCount = 0;
    let correctCount = 0;
    const questionResults = [];

    interviewQuestions.forEach((q, i) => {
        const result = scoreAnswer(answers[i], q);
        totalScore += result.score;
        if (result.isCorrect) correctCount++;

        const opts = q.options || [];
        const selIdx = result.selectedOption;
        const selLetter = selIdx >= 0 && selIdx < 4 ? ['A', 'B', 'C', 'D'][selIdx] : '';
        const selText = selIdx >= 0 && opts[selIdx] ? `Option ${selLetter}: ${opts[selIdx]}` : 'No option selected';

        questionResults.push({
            questionId: q.id,
            question: q.question,
            answer: selText,
            selectedOption: result.selectedOption,
            correctOption: result.correctOption,
            isCorrect: result.isCorrect,
            score: result.score,
            feedback: result.feedback,
            category: q.category
        });

        if (q.category === 'Technical') {
            technicalScore += result.score;
            techCount++;
        } else {
            hrScore += result.score;
            hrCount++;
        }
        commScore += result.commScore || (result.isCorrect ? 100 : 50);
    });

    const totalQuestions = interviewQuestions.length || 1;
    const overall = Math.round((correctCount / totalQuestions) * 100);
    const techAvg = techCount ? Math.round(technicalScore / techCount) : 0;
    const hrAvg = hrCount ? Math.round(hrScore / hrCount) : 0;
    const commAvg = Math.round(commScore / totalQuestions);

    const status = overall >= 70 ? 'Passed' : overall >= 50 ? 'Review' : 'Failed';

    // Save result to cloud & local WITH admin isolation tags
    const newResult = {
        id: Date.now(),
        name: candidateData.name,
        email: candidateData.email,
        adminEmail: candidateData.adminEmail || 'admin@quizora.com',
        examCode: candidateData.examCode || 'QUIZ-TECH',
        date: new Date().toISOString().split('T')[0],
        overallScore: overall,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        technical: techAvg,
        hr: hrAvg,
        communication: commAvg,
        status,
        questionResults
    };

    addResultToCloud(newResult);

    // Show complete screen
    document.getElementById('interviewScreen').style.display = 'none';
    document.getElementById('completeScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = `${correctCount}/${totalQuestions} (${overall}%)`;
    document.getElementById('finalScore').className = '';
    document.getElementById('finalScore').style.fontFamily = 'var(--font-heading)';
    document.getElementById('finalScore').style.fontSize = '2.2rem';
    document.getElementById('finalScore').style.fontWeight = '700';

    const badgeClass = status === 'Passed' ? 'badge-success' : status === 'Review' ? 'badge-warning' : 'badge-danger';
    document.getElementById('finalBadge').innerHTML = `<span class="badge ${badgeClass}" style="font-size:1rem;padding:8px 20px;">${status}</span>`;

    const submitNotice = document.getElementById('submittedToAdminInfo');
    if (submitNotice) {
        submitNotice.innerHTML = `Your evaluation has been submitted to examiner <strong>${escapeHtml(candidateData.adminName)}</strong> under exam code <strong>${escapeHtml(candidateData.examCode)}</strong>.`;
    }

    showToast('Examination submitted successfully!', 'success');
}
