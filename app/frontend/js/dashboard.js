/* ===== Dashboard JS ===== */
document.addEventListener('DOMContentLoaded', async () => {
    // Route guard: require admin
    if (!requireAuth(['admin'])) return;

    updateUserDisplay();
    renderDashboard();

    // Sync cloud data in background and re-render without blocking UI
    Promise.all([syncResultsFromSupabase(), syncQuestionsFromSupabase()]).then(() => {
        renderDashboard();
    }).catch(err => console.log('Background sync note:', err));
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        drawBarChart(getResults());
        drawDonutChart(getQuestions());
    }, 150);
});

function updateUserDisplay() {
    const user = localStorage.getItem('sies_user') || 'Admin';
    const email = localStorage.getItem('sies_email') || 'admin@quizora.com';
    const examCode = typeof getCurrentAdminExamCode === 'function' ? getCurrentAdminExamCode() : 'QUIZ-TECH';

    const el = document.getElementById('userName');
    if (el) el.textContent = user;

    const sidebarName = document.getElementById('sidebarUserName');
    if (sidebarName) sidebarName.textContent = user;

    const sidebarEmail = document.getElementById('sidebarUserEmail');
    if (sidebarEmail) sidebarEmail.textContent = email;

    const initials = document.getElementById('userInitials');
    if (initials) {
        const parts = user.trim().split(/\s+/);
        initials.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : user.slice(0, 2).toUpperCase();
    }

    const codeDisplay = document.getElementById('adminExamCodeDisplay');
    if (codeDisplay) codeDisplay.textContent = examCode;

    const demoBtn = document.getElementById('studentDemoBtn');
    if (demoBtn) demoBtn.href = `interview.html?code=${encodeURIComponent(examCode)}`;
}

function copyExamCode() {
    const code = typeof getCurrentAdminExamCode === 'function' ? getCurrentAdminExamCode() : 'QUIZ-TECH';
    const btnText = document.getElementById('copyBtnText');
    const originalText = btnText ? btnText.textContent : 'Copy Code';

    copyTextToClipboard(code).then(() => {
        if (btnText) {
            btnText.textContent = '✓ Copied!';
            setTimeout(() => { if (btnText) btnText.textContent = originalText; }, 2000);
        }
        if (typeof showToast === 'function') {
            showToast(`Exam code "${code}" copied to clipboard!`, 'success');
        }
    }).catch(() => {
        prompt('Copy your student exam code:', code);
    });
}

function copyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
        // Modern async clipboard API if available and page is focused
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(resolve).catch(() => {
                if (fallbackCopy(text)) resolve();
                else reject();
            });
        } else {
            if (fallbackCopy(text)) resolve();
            else reject();
        }
    });
}

function fallbackCopy(text) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        return success;
    } catch (e) {
        return false;
    }
}

function renderDashboard() {
    const results = getResults();
    const questions = getQuestions();

    // KPI
    document.getElementById('kpiInterviews').textContent = results.length;
    const avg = results.length ? Math.round(results.reduce((s, r) => s + (Number(r.overallScore) || 0), 0) / results.length) : 0;
    document.getElementById('kpiAvgScore').textContent = avg + '%';
    const passed = results.filter(r => r.status === 'Passed').length;
    document.getElementById('kpiPassRate').textContent = results.length ? Math.round((passed / results.length) * 100) + '%' : '0%';
    document.getElementById('kpiQuestions').textContent = questions.length;

    // Recent table
    const tbody = document.getElementById('recentTable');
    if (tbody) {
        tbody.innerHTML = '';
        if (results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No interview records yet.</td></tr>`;
        } else {
            results.slice(0, 6).forEach(r => {
                const statusClass = r.status === 'Passed' ? 'badge-success' : r.status === 'Failed' ? 'badge-danger' : 'badge-warning';
                tbody.innerHTML += `<tr>
            <td><strong>${escapeHtml(r.name)}</strong><br><small style="color:var(--text-muted)">${escapeHtml(r.email)}</small></td>
            <td>${formatDate(r.date)}</td>
            <td>${r.technical}%</td>
            <td>${r.hr}%</td>
            <td><strong>${r.overallScore}%</strong></td>
            <td><span class="badge ${statusClass}">${r.status}</span></td>
          </tr>`;
            });
        }
    }

    // Bar Chart
    drawBarChart(results);
    // Donut Chart
    drawDonutChart(questions);
}

function drawBarChart(results) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    const container = canvas.parentElement;
    const clientW = container && container.clientWidth ? container.clientWidth : 0;
    const W = Math.max(340, clientW || 500);
    const H = 260;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = '100%';
    canvas.style.maxWidth = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 30, right: 20, bottom: 44, left: 45 };
    const chartW = Math.max(240, W - pad.left - pad.right);
    const chartH = H - pad.top - pad.bottom;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(100 - i * 20, pad.left - 8, y + 4);
    }

    // Bars
    const data = results.slice(0, 6);
    if (data.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No interview records yet', W / 2, H / 2);
        return;
    }

    const slotW = chartW / data.length;
    const barW = Math.max(14, Math.min(38, slotW * 0.55));

    data.forEach((r, i) => {
        const x = pad.left + i * slotW + (slotW - barW) / 2;
        const score = Math.max(0, Math.min(100, Number(r.overallScore) || 0));
        const barH = Math.max(4, (score / 100) * chartH);
        const y = pad.top + chartH - barH;

        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, '#22d3ee');
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
        } else {
            ctx.rect(x, y, barW, barH);
        }
        ctx.fill();

        // Name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        const name = (r.name || 'User').split(' ')[0];
        ctx.fillText(name, x + barW / 2, H - pad.bottom + 18);

        // Score
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(score + '%', x + barW / 2, y - 8);
    });
}

function drawDonutChart(questions) {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    const container = canvas.parentElement;
    const maxW = container ? container.clientWidth : 240;
    const size = Math.max(160, Math.min(220, maxW - 20));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const categories = {};
    questions.forEach(q => {
        categories[q.category] = (categories[q.category] || 0) + 1;
    });
    const keys = Object.keys(categories);
    const values = keys.map(k => categories[k]);
    const total = values.reduce((a, b) => a + b, 0);
    const colors = ['#22d3ee', '#8b5cf6', '#34d399', '#fbbf24', '#fb7185'];

    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.42;
    const innerR = size * 0.27;
    let startAngle = -Math.PI / 2;

    if (total === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.arc(cx, cy, innerR, Math.PI * 2, 0, true);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        return;
    }

    keys.forEach((key, i) => {
        const sliceAngle = (values[i] / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy + 4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Questions', cx, cy + 20);

    // Legend
    const legend = document.getElementById('donutLegend');
    if (legend) {
        legend.innerHTML = keys.map((k, i) =>
            `<span style="display:inline-flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--text-secondary);">
        <span style="width:10px;height:10px;border-radius:50%;background:${colors[i % colors.length]};display:inline-block;"></span>
        ${k} (${values[i]})
      </span>`
        ).join('');
    }
}
