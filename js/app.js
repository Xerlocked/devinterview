/**
 * app.js — Main page logic
 * Loads data.json and renders category cards
 */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('Failed to load data.json');
    const categories = await res.json();

    renderCategories(grid, categories);
    updateProgress(categories);
  } catch (err) {
    grid.innerHTML = `
      <div style="text-align:center;color:var(--text-muted);padding:40px 0;">
        <p>데이터를 불러올 수 없습니다.</p>
        <p style="font-size:0.8rem;margin-top:8px;">node build.js 를 먼저 실행해주세요.</p>
      </div>
    `;
    console.error(err);
  }
});

function renderCategories(container, categories) {
  const arrowSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

  categories.forEach((cat, i) => {
    const answered = countAnswered(cat.id, cat.questionCount);
    const card = document.createElement('a');
    card.href = `category.html?id=${encodeURIComponent(cat.id)}`;
    card.className = 'category-card animate-in';
    card.id = `category-${cat.id}`;
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="category-card__content">
        <div class="category-card__title">${escapeHtml(cat.title)}</div>
        <div class="category-card__meta">${cat.questionCount}문항 · 작성 ${answered}/${cat.questionCount}</div>
      </div>
      <div class="category-card__arrow">${arrowSVG}</div>
    `;
    container.appendChild(card);
  });
}

function countAnswered(categoryId, total) {
  let count = 0;
  for (let i = 1; i <= total; i++) {
    const key = `answer_${categoryId}_${i}`;
    const val = localStorage.getItem(key);
    if (val && val.trim().length > 0) count++;
  }
  return count;
}

function updateProgress(categories) {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;

  let totalQuestions = 0;
  let totalAnswered = 0;
  categories.forEach(cat => {
    totalQuestions += cat.questionCount;
    totalAnswered += countAnswered(cat.id, cat.questionCount);
  });

  const pct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
