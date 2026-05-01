/**
 * category.js — Category detail page logic
 * Renders questions, user answer textareas (localStorage-backed),
 * and collapsible best answer sections.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('id');

  if (!categoryId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('Failed to load data.json');
    const categories = await res.json();

    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      document.getElementById('category-content').innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:60px 0;">카테고리를 찾을 수 없습니다.</p>';
      return;
    }

    document.title = `${category.title} — DevInterview`;
    renderCategoryPage(category);
  } catch (err) {
    console.error(err);
    document.getElementById('category-content').innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding:60px 0;">데이터를 불러올 수 없습니다.</p>';
  }
});

function renderCategoryPage(category) {
  // Header
  const header = document.getElementById('category-header');
  header.innerHTML = `
    <h1 class="category-header__title">${escapeHtml(category.title)}</h1>
    <p class="category-header__count">총 ${category.questionCount}문항</p>
  `;

  // Content
  const content = document.getElementById('category-content');
  content.innerHTML = '';

  category.parts.forEach((part, partIdx) => {
    const section = document.createElement('section');
    section.className = 'part-section animate-in';
    section.style.animationDelay = `${partIdx * 0.1}s`;

    const partTitle = document.createElement('h2');
    partTitle.className = 'part-title';
    partTitle.textContent = part.name;
    section.appendChild(partTitle);

    part.questions.forEach(q => {
      section.appendChild(createQuestionCard(category.id, q));
    });

    content.appendChild(section);
  });

  // Progress bar
  updateProgress(category);
}

function createQuestionCard(categoryId, question) {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.id = `question-${question.number}`;

  const storageKey = `answer_${categoryId}_${question.number}`;
  const savedAnswer = localStorage.getItem(storageKey) || '';

  // Determine if best answer exists
  const hasBestAnswer = question.answer && question.answer.trim().length > 0;

  const pencilSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
  const chevronSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  card.innerHTML = `
    <div class="question-card__header">
      <span class="question-card__number">Q${question.number}</span>
      <p class="question-card__text">${formatAnswer(question.text)}</p>
    </div>

    <div class="answer-section">
      <label class="answer-section__label" for="answer-${question.number}">
        ${pencilSVG}
        나의 답변
      </label>
      <textarea
        id="answer-${question.number}"
        class="answer-textarea"
        placeholder="여기에 답변을 작성하세요..."
        rows="5"
      >${escapeHtml(savedAnswer)}</textarea>
      <div class="answer-saved" id="saved-${question.number}">✓ 자동 저장됨</div>
    </div>

    <div class="best-answer-section">
      <button class="best-answer-toggle" id="toggle-${question.number}" aria-expanded="false">
        <span>🏆 우수 답변 ${hasBestAnswer ? '보기' : '(준비 중)'}</span>
        <span class="best-answer-toggle__icon" id="icon-${question.number}">${chevronSVG}</span>
      </button>
      <div class="best-answer-content" id="content-${question.number}">
        <div class="best-answer-content__inner">
          ${hasBestAnswer
            ? `<p>${formatAnswer(question.answer)}</p>`
            : `<p class="best-answer-empty">아직 등록된 우수 답변이 없습니다.</p>`
          }
        </div>
      </div>
    </div>
  `;

  // Bind events after insertion
  setTimeout(() => {
    // Textarea auto-save
    const textarea = document.getElementById(`answer-${question.number}`);
    const savedIndicator = document.getElementById(`saved-${question.number}`);
    let saveTimeout;

    if (textarea) {
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          localStorage.setItem(storageKey, textarea.value);
          savedIndicator.classList.add('visible');
          setTimeout(() => savedIndicator.classList.remove('visible'), 1500);
          // Update progress
          const params = new URLSearchParams(window.location.search);
          const catId = params.get('id');
          fetch('./data.json').then(r => r.json()).then(cats => {
            const cat = cats.find(c => c.id === catId);
            if (cat) updateProgress(cat);
          });
        }, 500);
      });
    }

    // Toggle best answer
    const toggleBtn = document.getElementById(`toggle-${question.number}`);
    const contentDiv = document.getElementById(`content-${question.number}`);
    const iconDiv = document.getElementById(`icon-${question.number}`);

    if (toggleBtn && contentDiv) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = contentDiv.classList.contains('open');
        contentDiv.classList.toggle('open');
        iconDiv.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', !isOpen);
      });
    }
  }, 0);

  return card;
}

function updateProgress(category) {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;

  let answered = 0;
  category.parts.forEach(part => {
    part.questions.forEach(q => {
      const key = `answer_${category.id}_${q.number}`;
      const val = localStorage.getItem(key);
      if (val && val.trim().length > 0) answered++;
    });
  });

  const pct = category.questionCount > 0 ? (answered / category.questionCount) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

function formatAnswer(text) {
  // Simple markdown-like formatting
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
