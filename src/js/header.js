const newTabBtn = document.querySelector('[data-action="new-tab"]');
const exportBtn = document.querySelector('[data-action="export"]');
const nameInput = document.querySelector(
  'input[placeholder*="프로젝트 이름"], #project-name',
);

let html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>`;

// 프로젝트명과 Blob 객체를 한 번에 생성하는 통합 함수
const createHtmlBlob = () => {
  const title = nameInput?.value.trim() || "Document";
  const updatedHtml = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`,
  );
  return {
    title: title.replace(/[\\/:*?"<>|]/g, "_"),
    blob: new Blob([updatedHtml], { type: "text/html;charset=utf-8" }),
  };
};

// 1. [새 탭] 버튼
newTabBtn.addEventListener("click", () => {
  const { blob } = createHtmlBlob();
  window.open(URL.createObjectURL(blob), "_blank");
});

// 2. [내보내기] 버튼
exportBtn.addEventListener("click", () => {
  const { title, blob } = createHtmlBlob();
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `${title}.html`,
  });
  a.click();
  URL.revokeObjectURL(a.href);
});
