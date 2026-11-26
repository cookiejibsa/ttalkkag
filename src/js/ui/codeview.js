// codeview.js — HTML 코드 문법 강조와 줄 번호 표시

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightTag(token) {
  const match = token.match(/^(<\/?)([\w-]+)([\s\S]*?)(\/?>)$/);
  if (!match) return escapeHTML(token);
  const [, bracket, name, rawAttributes, ending] = match;
  const attributes = rawAttributes.replace(
    /(\s+)([\w:.-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/g,
    (_, space, attribute, equals, value) => (
      `${space}<span data-token="attribute">${escapeHTML(attribute)}</span>`
      + `${escapeHTML(equals)}<span data-token="string">${escapeHTML(value)}</span>`
    ),
  );

  return `${escapeHTML(bracket)}<span data-token="tag">${escapeHTML(name)}</span>`
    + `${attributes}${escapeHTML(ending)}`;
}

/** @param {string} html */
export function highlightHTML(html) {
  const tokens = html.match(/<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[\w-]+(?:\s[^<>]*?)?\/?>|[^<]+/gi) ?? [];
  return tokens.map((token) => {
    if (token.startsWith("<!--")) return `<span data-token="comment">${escapeHTML(token)}</span>`;
    if (/^<!doctype/i.test(token)) return `<span data-token="tag">${escapeHTML(token)}</span>`;
    if (/^<\/?[\w-]+/.test(token)) return highlightTag(token);
    return escapeHTML(token);
  }).join("");
}

/** @param {HTMLElement | null} codeElement @param {HTMLElement | null} lineElement @param {string} html */
export function renderCodeview(codeElement, lineElement, html) {
  if (codeElement) codeElement.innerHTML = highlightHTML(html);
  if (lineElement) {
    const lineCount = Math.max(1, html.split("\n").length);
    lineElement.replaceChildren(document.createTextNode(
      Array.from({ length: lineCount }, (_, index) => String(index + 1)).join("\n"),
    ));
  }
}
