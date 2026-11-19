/* ===== Results JS ===== */
let currentCandidate = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth(['admin'])) return;
    updateSidebarUser();

    // Render table
    renderAllResults();

    // Sync cloud results in background and re-render without blocking UI
    syncResultsFromSupabase().then(() => renderAllResults()).catch(err => console.log('Sync note:', err));
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

    const badge = document.getElementById('resultsAdminBadge');
    if (badge) {
        badge.textContent = `${user} (${email}) | Exam Code: ${examCode}`;
    }
}

function updateKpiCards(results) {
    const totalCount = document.getElementById('resTotalCount');
    const avgScore = document.getElementById('resAvgScore');
    const passRate = document.getElementById('resPassRate');
    const topPerformer = document.getElementById('resTopPerformer');

    if (totalCount) totalCount.textContent = results.length;

    const avg = results.length ? Math.round(results.reduce((s, r) => s + (Number(r.overallScore) || 0), 0) / results.length) : 0;
    if (avgScore) avgScore.textContent = avg + '%';

    const passed = results.filter(r => r.status === 'Passed').length;
    if (passRate) passRate.textContent = results.length ? Math.round((passed / results.length) * 100) + '%' : '0%';

    if (topPerformer) {
        if (results.length === 0) {
            topPerformer.textContent = 'None yet';
        } else {
            const sorted = [...results].sort((a, b) => (Number(b.overallScore) || 0) - (Number(a.overallScore) || 0));
            const top = sorted[0];
            topPerformer.textContent = `${(top.name || 'Candidate').split(' ')[0]} (${top.overallScore}%)`;
        }
    }
}

function filterAllCandidates() {
    const filterEl = document.getElementById('statusFilter');
    const searchEl = document.getElementById('searchCandidate');
    if (filterEl) filterEl.value = '';
    if (searchEl) searchEl.value = '';
    renderAllResults();
    const tableCard = document.getElementById('allCandidateTableCard');
    if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth' });
}

function filterPassedCandidates() {
    const filterEl = document.getElementById('statusFilter');
    if (filterEl) filterEl.value = 'Passed';
    renderAllResults();
    const tableCard = document.getElementById('allCandidateTableCard');
    if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth' });
}

function openTopPerformerModal() {
    const results = getResults();
    if (results.length === 0) {
        showToast('No candidate evaluation records yet.', 'info');
        return;
    }
    const sorted = [...results].sort((a, b) => (Number(b.overallScore) || 0) - (Number(a.overallScore) || 0));
    openDetailModal(sorted[0].id);
}

function renderAllResults() {
    const results = getResults();
    updateKpiCards(results);

    const filterEl = document.getElementById('statusFilter');
    const searchEl = document.getElementById('searchCandidate');
    const filter = filterEl ? filterEl.value : '';
    const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

    const filtered = results.filter(r => {
        if (filter && r.status !== filter) return false;
        if (search) {
            const matchName = (r.name || '').toLowerCase().includes(search);
            const matchEmail = (r.email || '').toLowerCase().includes(search);
            if (!matchName && !matchEmail) return false;
        }
        return true;
    });

    const tbody = document.getElementById('allResultsTable');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-muted);">No candidate records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((r, i) => {
        const statusClass = r.status === 'Passed' ? 'badge-success' : r.status === 'Failed' ? 'badge-danger' : 'badge-warning';
        return `<tr onclick="openDetailModal(${r.id})" title="Click to view full evaluation report">
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(r.name)}</strong><br><small style="color:var(--text-muted)">${escapeHtml(r.email)}</small></td>
      <td>${formatDate(r.date)}</td>
      <td>${r.technical}%</td>
      <td>${r.hr}%</td>
      <td>${r.communication ?? '-'}%</td>
      <td><strong>${r.overallScore}%</strong></td>
      <td><span class="badge ${statusClass}">${r.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openDetailModal(${r.id})" style="padding:6px 14px;font-size:0.8rem;">
          View Report
        </button>
      </td>
    </tr>`;
    }).join('');
}

function openDetailModal(id) {
    const results = getResults();
    const r = results.find(item => String(item.id) === String(id));
    if (!r) return;

    currentCandidate = r;
    const modal = document.getElementById('detailModal');
    if (!modal) return;

    // Header info
    const nameEl = document.getElementById('modalCandidateName');
    const metaEl = document.getElementById('modalCandidateMeta');
    const badgeEl = document.getElementById('modalStatusBadge');

    if (nameEl) nameEl.textContent = r.name || 'Candidate';
    if (metaEl) metaEl.textContent = `${r.email || 'N/A'} • Evaluated on ${formatDate(r.date || new Date().toISOString())}`;

    const status = r.status || 'Review';
    const statusClass = status === 'Passed' ? 'badge-success' : status === 'Failed' ? 'badge-danger' : 'badge-warning';
    if (badgeEl) {
        badgeEl.className = `badge ${statusClass}`;
        badgeEl.textContent = status;
    }

    // Overall Score & Gauge
    const score = Number(r.overallScore) || 0;
    const gaugeScore = document.getElementById('gaugeScore');
    if (gaugeScore) gaugeScore.textContent = score + '%';
    drawGauge(score);

    // Skill Bars
    animateBar('techBar', 'techScore', r.technical || 0);
    animateBar('hrBar', 'hrScore', r.hr || 0);
    animateBar('commBar', 'commScore', r.communication || 0);

    // Question Feedback List
    const feedbackList = document.getElementById('feedbackList');
    if (feedbackList) {
        const qResults = r.questionResults;
        if (qResults && Array.isArray(qResults) && qResults.length > 0) {
            feedbackList.innerHTML = qResults.map((qr, i) => {
                const isCorrect = qr.isCorrect === true || Number(qr.score) === 100;
                const statusBadge = isCorrect
                    ? `<span class="badge badge-success" style="font-size:0.75rem;">✓ Correct (100%)</span>`
                    : `<span class="badge badge-danger" style="font-size:0.75rem;">✗ Incorrect (0%)</span>`;
                return `<div class="glass-card feedback-item" style="margin-bottom:12px;padding:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px;">
              <div style="font-weight:600;font-size:0.95rem;">Q${i + 1}: ${escapeHtml(qr.question || 'Exam Question')}</div>
              <div>${statusBadge}</div>
            </div>
            <div style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:8px;">
              ${escapeHtml(qr.feedback || '')}
            </div>
            <div style="font-size:0.85rem;background:var(--bg-glass);padding:8px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-glass);">
              <span style="color:var(--text-muted);margin-right:6px;">Student's Selection:</span>
              <strong style="color:${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${escapeHtml(qr.answer || 'No option selected')}</strong>
            </div>
          </div>`;
            }).join('');
        } else {
            feedbackList.innerHTML = `
              <div style="padding:20px;text-align:center;color:var(--text-secondary);background:var(--bg-glass);border-radius:var(--radius-sm);border:1px solid var(--border-glass);">
                <p>Aggregate performance verified: <strong>Technical: ${r.technical}%</strong>, <strong>HR: ${r.hr}%</strong>, <strong>Communication: ${r.communication || 75}%</strong>.</p>
              </div>`;
        }
    }

    modal.classList.add('active');
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
});

// Close modal on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('detailModal');
    if (modal && e.target === modal) closeDetailModal();
});

function animateBar(barId, scoreId, value) {
    const bar = document.getElementById(barId);
    const score = document.getElementById(scoreId);
    const val = Math.max(0, Math.min(100, Number(value) || 0));
    if (bar) bar.style.width = val + '%';
    if (score) score.textContent = val + '%';
}

function drawGauge(score) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, radius = 70, lineWidth = 12;

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Score arc
    const startAngle = -Math.PI / 2;
    const scoreVal = Math.max(0, Math.min(100, Number(score) || 0));
    const endAngle = startAngle + (scoreVal / 100) * Math.PI * 2;

    if (scoreVal > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, '#22d3ee');
        grad.addColorStop(1, '#8b5cf6');
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
