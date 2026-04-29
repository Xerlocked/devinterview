# DevInterview — 게임 개발자 기술 면접 준비

게임 개발자 기술 면접을 위한 질문 & 답변 연습 사이트입니다.  
GitHub Pages로 호스팅되며, 답변은 브라우저 로컬 저장소에 자동 저장됩니다.

## 📂 카테고리

| 카테고리 | 문항 수 |
|---------|--------|
| 자료구조 & 알고리즘 | 30 |
| C++ & 운영체제 | 30 |
| 선형대수 & 그래픽스 & 렌더링 & 최적화 | 30 |
| 언리얼 엔진 & DirectX | 30 |

## 🚀 사용 방법

### 빌드
```bash
node build.js
```
`data/*.md` 파일을 파싱하여 `data.json`을 생성합니다.

### 로컬 실행
```bash
npx serve .
```

### GitHub Pages 배포
1. GitHub에 push
2. Settings → Pages → Source: `main` 브랜치, `/` (root) 선택
3. `https://<username>.github.io/devinterview/` 에서 확인

## ✏️ 우수 답변 추가

`data/*.md` 파일에서 각 질문 아래에 다음 형식으로 추가:

```markdown
1. 질문 내용...

<!-- answer-start -->
우수 답변을 여기에 작성합니다.
**마크다운 형식** 사용 가능합니다.
<!-- answer-end -->
```

추가 후 `node build.js`를 다시 실행하면 반영됩니다.