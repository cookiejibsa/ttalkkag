// codeGenerator.js — 편집 중인 태그를 독립 실행 가능한 HTML 문서로 생성

const validTagName = /^[a-z][a-z0-9-]*$/i;
const validAttributeName = /^[a-zA-Z_:][a-zA-Z0-9:._-]*$/;
const voidTags = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

/** @param {{ tagId: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }>, text: string }} draft */
export function serializeTag(draft) {
  if (!draft || !validTagName.test(draft.tagId)) return "";

  const attributes = draft.attributes
    .filter(({ name, value }) => {
      const attrName = name.trim();
      if (!validAttributeName.test(attrName) || /^on/i.test(attrName)) return false;
      if (value === "" && attrName.toLowerCase() !== "alt") return false;
      const lowerName = attrName.toLowerCase();
      const lowerValue = value.toLowerCase().replace(/[\u0000-\u0020]/g, "");
      return !["href", "src", "action", "formaction"].includes(lowerName)
        || (!lowerValue.startsWith("javascript:") && !lowerValue.startsWith("data:text/html"));
    })
    .map(({ name, value }) => ` ${name.trim()}="${escapeAttribute(value)}"`)
    .join("");

  const tagName = draft.tagId.toLowerCase();
  if (voidTags.has(tagName) || !draft.needCloseTag) return `<${tagName}${attributes}>`;
  return `<${tagName}${attributes}>${escapeText(draft.text ?? "")}</${tagName}>`;
}

/** @param {{ tagId: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }>, text: string } | null} draft @param {string} [projectName] */
export function Generate(draft, projectName = "Document") {
  const title = escapeText(projectName.trim() || "Document");
  const element = serializeTag(draft);
  const bodyLines = element ? `    ${element}\n` : "";

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
${bodyLines}  </body>
</html>`;
}

// Keep the named initializer available for any existing module imports.
export const Init = async () => true;
