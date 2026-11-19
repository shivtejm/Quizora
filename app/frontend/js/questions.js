/* ===== Questions JS ===== */
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth(['admin'])) return;
    updateSidebarUser();
    renderQuestions();
    syncQuestionsFromSupabase().then(() => renderQuestions()).catch(err => console.log('Sync note:', err));
});

function updateSidebarUser() {
    const user = localStorage.getItem('sies_user') || 'Admin';
    const email = localStorage.getItem('sies_email') || 'admin@quizora.com';
    const examCode = typeof getCurrentAdminExamCode === 'function' ? getCurrentAdminExamCode() : 'QUIZ-TECH';

    const sidebarName = document.getElementById('sidebarUserName');
    if (sidebarName) sidebarName.textContent = user;
    const sidebarEmail = document.getElementById('sidebarUserEmail');
    if (sidebarEmail) sidebarEmail.textContent = email;
    const initials = document.getElementById('userInitials');
    if (initials) {
        const parts = user.trim().split(/\s+/);
        initials.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : user.slice(0, 2).toUpperCase();
    }

    const badge = document.getElementById('qbAdminBadge');
    if (badge) {
        badge.textContent = `${user} (${email}) | Exam Code: ${examCode}`;
    }
}

function renderQuestions() {
    let questions = getQuestions();
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        questions = SEED_QUESTIONS;
        saveQuestions(SEED_QUESTIONS);
    }
    const catEl = document.getElementById('filterCategory');
    const diffEl = document.getElementById('filterDifficulty');
    const searchEl = document.getElementById('searchInput');

    const category = catEl ? catEl.value : '';
    const difficulty = diffEl ? diffEl.value : '';
    const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

    let filtered = questions.filter(q => {
        if (category && q.category !== category) return false;
        if (difficulty && q.difficulty !== difficulty) return false;
        if (search) {
            const matchQ = (q.question || '').toLowerCase().includes(search);
            const matchT = (q.type || '').toLowerCase().includes(search);
            const matchC = (q.category || '').toLowerCase().includes(search);
            if (!matchQ && !matchT && !matchC) return false;
        }
        return true;
    });

    const tbody = document.getElementById('questionsTable');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = filtered.map((q, i) => {
        const diffClass = q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger';
        const catClass = q.category === 'Technical' ? 'badge-info' : 'badge-violet';
        const opts = q.options && q.options.length ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
        const correctIdx = (typeof q.correctAnswer === 'number') ? q.correctAnswer : parseInt(q.correctAnswer || 0);
        const correctLetter = ['A', 'B', 'C', 'D'][correctIdx] || 'A';
        const correctText = opts[correctIdx] || opts[0];

        return `<tr>
      <td>${i + 1}</td>
      <td style="max-width:380px;line-height:1.4;">
        <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(q.question)}</div>
        <div style="font-size:0.8rem;background:rgba(255,255,255,0.04);padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);display:inline-block;">
          <span style="color:var(--text-muted);margin-right:4px;">Correct:</span>
          <span style="color:var(--accent-emerald);font-weight:700;">Option ${correctLetter}: ${escapeHtml(correctText)}</span>
        </div>
      </td>
      <td><span class="badge ${catClass}">${escapeHtml(q.category)}</span></td>
      <td>${escapeHtml(q.type || '-')}</td>
      <td><span class="badge ${diffClass}">${escapeHtml(q.difficulty)}</span></td>
      <td>${q.points || 10}</td>
      <td style="white-space:nowrap;text-align:center;">
        <div class="table-actions">
          <button class="table-action-btn edit" onclick="editQuestion(${q.id})" title="Edit Question" aria-label="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="table-action-btn delete" onclick="deleteQuestion(${q.id})" title="Delete Question" aria-label="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal(q) {
    document.getElementById('questionModal').classList.add('active');
    if (q) {
        document.getElementById('modalTitle').textContent = 'Edit Multiple Choice Question';
        document.getElementById('editId').value = q.id;
        document.getElementById('qText').value = q.question;
        document.getElementById('qCategory').value = q.category;
        document.getElementById('qType').value = q.type;
        document.getElementById('qDifficulty').value = q.difficulty;
        document.getElementById('qPoints').value = q.points;

        const opts = q.options && q.options.length ? q.options : ['', '', '', ''];
        document.getElementById('opt0').value = opts[0] || '';
        document.getElementById('opt1').value = opts[1] || '';
        document.getElementById('opt2').value = opts[2] || '';
        document.getElementById('opt3').value = opts[3] || '';

        const correctIdx = (typeof q.correctAnswer === 'number') ? q.correctAnswer : parseInt(q.correctAnswer || 0);
        const radio = document.getElementById(`correct${correctIdx}`) || document.getElementById('correct0');
        if (radio) radio.checked = true;
    } else {
        document.getElementById('modalTitle').textContent = 'Add Multiple Choice Question';
        document.getElementById('editId').value = '';
        document.getElementById('questionForm').reset();
        document.getElementById('correct0').checked = true;
    }
}

function closeModal() {
    document.getElementById('questionModal').classList.remove('active');
}

async function saveQuestion(e) {
    e.preventDefault();
    const editId = document.getElementById('editId').value;
    const opts = [
        document.getElementById('opt0').value.trim(),
        document.getElementById('opt1').value.trim(),
        document.getElementById('opt2').value.trim(),
        document.getElementById('opt3').value.trim()
    ];
    const correctRadio = document.querySelector('input[name="correctOptionRadio"]:checked');
    const correctAnswer = correctRadio ? parseInt(correctRadio.value) : 0;

    const data = {
        question: document.getElementById('qText').value.trim(),
        category: document.getElementById('qCategory').value,
        type: document.getElementById('qType').value.trim(),
        difficulty: document.getElementById('qDifficulty').value,
        points: parseInt(document.getElementById('qPoints').value) || 10,
        options: opts,
        correctAnswer: correctAnswer
    };

    if (editId) {
        data.id = parseInt(editId);
    }

    closeModal();
    await saveQuestionToCloud(data);
    showToast(editId ? 'Question updated successfully!' : 'Question added successfully!', 'success');
    renderQuestions();
}

function editQuestion(id) {
    const q = getQuestions().find(q => q.id === id);
    if (q) openModal(q);
}

async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    await deleteQuestionFromCloud(id);
    showToast('Question deleted.', 'info');
    renderQuestions();
}
