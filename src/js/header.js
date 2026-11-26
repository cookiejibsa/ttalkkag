// header.js — 상단 바: 프로젝트명 입력 및 액션 버튼(새 탭/내보내기/저장/불러오기/초기화) 이벤트 처리

const newTabBtns = document.querySelectorAll('[data-action="new-tab"]');
const exportBtn = document.querySelector('[data-action="export"]');
const copyBtn = document.querySelector('[data-action="copy-code"]');

const nameInput = document.querySelector("#project-name");
const preview = document.querySelector("#html-preview");
const codeOutput = document.querySelector("#code-output");
const lineNumbers = document.querySelector("#line-numbers");
const copyMessage = document.querySelector("#copy-message");

// 1. 더미 HTML 저장
let html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- 첫 번째 HTML -->
    <h1 class="title">Hello, World!</h1>
    <p>딸깍으로 만든 첫 번째 HTML입니다.</p>
  </body>
</html>`;

// 2. HTML 들여쓰기 구현
function formatHTML(source) {
  const tokens =
    source.match(
      /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[\w-]+(?:\s[^<>]*?)?\/?>|[^<]+/gi,
    ) || [];

  const voidTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  let result = "";
  let depth = 0;

  tokens.forEach((token) => {
    const value = token.trim();

    if (!value) return;

    // 닫는 태그인지 확인
    const isClosing = /^<\//.test(value);

    // 독립적인 태그인지 확인
    const isDoctype = /^<!doctype/i.test(value);
    const isComment = /^<!--/.test(value);

    const tagMatch = value.match(/^<\/?([\w-]+)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";

    const isVoid = voidTags.includes(tagName);
    const isSelfClosing = /\/>$/.test(value);

    if (isClosing) {
      depth = Math.max(0, depth - 1);
    }

    result += "  ".repeat(depth) + value + "\n";

    if (
      tagMatch &&
      !isClosing &&
      !isVoid &&
      !isSelfClosing &&
      !isDoctype &&
      !isComment
    ) {
      depth++;
    }
  });

  return result.trim();
}

// 3. HTML 특수문자 변환
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 4. HTML 문법 강조
function highlightHTML(source) {
  const tokens =
    source.match(
      /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[\w-]+(?:\s[^<>]*?)?\/?>|[^<]+/gi,
    ) || [];

  return tokens
    .map((token) => {
      // 주석
      if (token.startsWith("<!--")) {
        return `<span data-token="comment">${escapeHTML(token)}</span>`;
      }

      // DOCTYPE
      if (/^<!doctype/i.test(token)) {
        return `<span data-token="tag">${escapeHTML(token)}</span>`;
      }

      // HTML 태그
      if (/^<\/?[\w-]+/.test(token)) {
        const match = token.match(/^(<\/?)([\w-]+)([\s\S]*?)(\/?>)$/);

        if (!match) return escapeHTML(token);

        const [, bracket, tagName, attributes, ending] = match;

        // 속성에 색상 적용
        const coloredAttributes = attributes.replace(
          /(\s+)([\w:-]+)(=)("[^"]*"|'[^']*'|[^\s>]+)/g,
          (_, space, name, equal, value) => {
            return (
              `${space}<span data-token="attribute">${name}</span>` +
              `${equal}<span data-token="string">${escapeHTML(value)}</span>`
            );
          },
        );

        return (
          `${escapeHTML(bracket)}` +
          `<span data-token="tag">${tagName}</span>` +
          `${coloredAttributes}` +
          `${escapeHTML(ending)}`
        );
      }

      // 일반 텍스트
      return escapeHTML(token);
    })
    .join("");
}

// 5. 미리보기 및 코드 출력
function updateOutput() {
  const formattedHTML = formatHTML(html);

  // 왼쪽: 실제 HTML 렌더링
  preview.srcdoc = formattedHTML;

  // 오른쪽: 문법 강조된 HTML 표시
  codeOutput.innerHTML = highlightHTML(formattedHTML);

  // 줄 번호 생성
  const lineCount = formattedHTML.split("\n").length;

  lineNumbers.innerHTML = Array.from(
    { length: lineCount },
    (_, index) => index + 1,
  ).join("<br>");
}

// 처음 실행
updateOutput();

// 복사 메시지 표시 함수
function showCopyMessage(message) {
  copyMessage.textContent = message;

  // 기존 애니메이션 초기화
  copyMessage.classList.remove("show");
  void copyMessage.offsetWidth;

  // 애니메이션 다시 실행
  copyMessage.classList.add("show");
}

// 코드 복사
copyBtn.addEventListener("click", async () => {
  try {
    const formattedHTML = formatHTML(html);

    await navigator.clipboard.writeText(formattedHTML);

    showCopyMessage("✓ 코드가 복사되었습니다!");
  } catch (error) {
    showCopyMessage("복사에 실패했습니다.");
    console.error(error);
  }
});

// 7. 프로젝트명 및 HTML 파일 생성
function createHtmlBlob() {
  const title = nameInput?.value.trim() || "Document";

  const formattedHTML = formatHTML(html);

  const updatedHTML = formattedHTML.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHTML(title)}</title>`,
  );

  return {
    title: title.replace(/[\\/:*?"<>|]/g, "_"),
    blob: new Blob([updatedHTML], {
      type: "text/html;charset=utf-8",
    }),
  };
}

// 8. 새 탭 (상단 바와 렌더링부의 새 탭 버튼 모두 같은 동작)
newTabBtns.forEach((button) => {
  button.addEventListener("click", () => {
    const { blob } = createHtmlBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
});

// 9. 내보내기
exportBtn.addEventListener("click", () => {
  const { title, blob } = createHtmlBlob();

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.html`;
  a.click();

  URL.revokeObjectURL(url);
});
