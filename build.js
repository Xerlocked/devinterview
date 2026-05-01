const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(__dirname, 'data.json');

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  let title = '';
  const parts = [];
  let currentPart = null;
  let currentQuestion = null;
  let inAnswer = false;
  let answerLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse title: # ...
    const titleMatch = line.match(/^#\s+(.+)/);
    if (titleMatch && !line.startsWith('##')) {
      title = titleMatch[1].trim();
      continue;
    }

    // Parse part: ## [PART N] ...
    const partMatch = line.match(/^##\s+\[PART\s+\d+\]\s*(.+)/);
    if (partMatch) {
      // Save previous question's answer if any
      if (currentQuestion && inAnswer) {
        currentQuestion.answer = answerLines.join('\n').trim();
        inAnswer = false;
        answerLines = [];
      }

      currentPart = {
        name: partMatch[1].trim(),
        questions: []
      };
      parts.push(currentPart);
      continue;
    }

    // Parse answer blocks
    if (line.trim() === '<!-- answer-start -->') {
      inAnswer = true;
      answerLines = [];
      continue;
    }
    if (line.trim() === '<!-- answer-end -->') {
      if (currentQuestion) {
        currentQuestion.answer = answerLines.join('\n').trim();
      }
      inAnswer = false;
      answerLines = [];
      continue;
    }
    if (inAnswer) {
      answerLines.push(line);
      continue;
    }

    // Parse question: N. ...
    const questionMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (questionMatch && currentPart) {
      // Save previous question's answer if still collecting
      if (currentQuestion && inAnswer) {
        currentQuestion.answer = answerLines.join('\n').trim();
        inAnswer = false;
        answerLines = [];
      }

      currentQuestion = {
        number: parseInt(questionMatch[1]),
        text: questionMatch[2].trim(),
        answer: null
      };
      currentPart.questions.push(currentQuestion);
      continue;
    }
  }

  // Handle trailing answer block
  if (currentQuestion && inAnswer) {
    currentQuestion.answer = answerLines.join('\n').trim();
  }

  return { title, parts };
}

function build() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md'));
  const categories = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const id = path.basename(file, '.md');
    const parsed = parseMarkdownFile(filePath);

    categories.push({
      id,
      title: parsed.title,
      parts: parsed.parts,
      questionCount: parsed.parts.reduce((sum, p) => sum + p.questions.length, 0)
    });
  }

  // Sort categories in a logical order
  const order = ['자료구조_알고리즘', 'cpp_운영체제', '선형대수_그래픽스_렌더링_최적화', '언리얼_Directx', '수학_물리', '인성질문'];
  categories.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`✅ Built data.json with ${categories.length} categories`);
  categories.forEach(c => {
    console.log(`   📂 ${c.title} — ${c.questionCount} questions`);
  });
}

build();
