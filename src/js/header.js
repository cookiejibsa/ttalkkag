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

// 10. 저장 / 불러오기 / 초기화 메뉴: 항목을 고르거나 바깥을 누르거나 Esc를 누르면 닫기
const toolbarMenu = document.querySelector(".toolbar-menu");

if (toolbarMenu) {
  document.addEventListener("click", (event) => {
    if (toolbarMenu.open && !toolbarMenu.contains(event.target)) toolbarMenu.open = false;
  });

  toolbarMenu.querySelectorAll(".toolbar-menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      toolbarMenu.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") toolbarMenu.open = false;
  });
}

// 11. 다른 스크립트(main.js)가 문서를 바꿀 때 쓰는 통로
window.ttalkkagDocument = {
  getHtml: () => html,
  setHtml(nextHtml) {
    html = nextHtml;
    updateOutput();
  },
};

// 12. 저장 / 불러오기 / 초기화
// localStorage "project" 키에 [{ name, updatedAt, html }] 배열로 저장 (대시보드가 이 배열을 읽음)
const PROJECT_KEY = "project";
const EMPTY_HTML = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
  </body>
</html>`;

function readProjects() {
  try {
    const list = JSON.parse(localStorage.getItem(PROJECT_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveProject(showMessage = true) {
  const name = nameInput?.value.trim() || "제목 없는 프로젝트";
  const others = readProjects().filter((project) => project.name !== name);
  const saved = { name, updatedAt: new Date().toISOString(), html: formatHTML(html) };

  localStorage.setItem(PROJECT_KEY, JSON.stringify([saved, ...others]));
  if (showMessage) showCopyMessage(`✓ "${name}" 저장했습니다`);
}

function loadProject(project) {
  if (nameInput) nameInput.value = project.name;
  html = project.html;
  updateOutput();
  showCopyMessage(`✓ "${project.name}" 불러왔습니다`);
}

// 불러오기 창: 저장된 프로젝트를 최근 순으로 보여주고 고르면 불러옴
function openLoadDialog() {
  const projects = readProjects();
  const dialog = document.createElement("dialog");
  dialog.className = "project-dialog";

  const title = document.createElement("h2");
  title.textContent = "불러오기";
  dialog.append(title);

  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-dialog-empty";
    empty.textContent = "저장된 프로젝트가 없습니다.";
    dialog.append(empty);
  }

  projects.forEach((project) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "project-dialog-item";
    const date = new Date(project.updatedAt);
    item.innerHTML = `<strong></strong><span>${isNaN(date) ? "" : date.toLocaleString("ko-KR")}</span>`;
    item.querySelector("strong").textContent = project.name;
    item.addEventListener("click", () => {
      loadProject(project);
      dialog.close();
    });
    dialog.append(item);
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "project-dialog-close";
  closeButton.textContent = "닫기";
  closeButton.addEventListener("click", () => dialog.close());
  dialog.append(closeButton);

  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

document.querySelector('[data-action="save"]')?.addEventListener("click", () => saveProject());
document.querySelector('[data-action="load"]')?.addEventListener("click", openLoadDialog);
document.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
  if (!confirm("지금 만든 내용을 모두 지우고 빈 문서로 시작할까요?")) return;
  html = EMPTY_HTML;
  updateOutput();
});

// 대시보드로 갈 때 자동 저장
document.querySelector('[data-action="dashboard"]')?.addEventListener("click", () => saveProject(false));

// 대시보드에서 ?project=이름 으로 들어오면 그 프로젝트를 불러옴
const requestedProject = new URLSearchParams(location.search).get("project");
if (requestedProject) {
  const project = readProjects().find((item) => item.name === requestedProject);
  if (project) loadProject(project);
}
