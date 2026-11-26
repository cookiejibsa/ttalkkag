// canvas.js — 현재 태그 설정 미리보기

const safeAttributeName = /^[a-zA-Z_:][a-zA-Z0-9:._-]*$/;

/** @param {{ tagId: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }>, text: string }} draft */
export function createTagElement(draft) {
  const element = document.createElement(draft.tagId);
  element.dataset.ddalkkakPreview = "true";

  draft.attributes.forEach(({ name, value }) => {
    const normalizedName = name.trim();
    if (!safeAttributeName.test(normalizedName) || /^on/i.test(normalizedName)) return;
    const lowerName = normalizedName.toLowerCase();
    if (value === "" && lowerName !== "alt") return;
    const lowerValue = value.toLowerCase().replace(/[\u0000-\u0020]/g, "");
    if (["href", "src", "action", "formaction"].includes(lowerName)
      && (lowerValue.startsWith("javascript:") || lowerValue.startsWith("data:text/html"))) return;

    element.setAttribute(normalizedName, value);
  });

  if (draft.needCloseTag) element.textContent = draft.text;
  return element;
}

/** @param {HTMLElement} container @param {Parameters<typeof createTagElement>[0] | null} draft */
export function renderCanvas(container, draft) {
  if (!container) return;
  if (!draft) {
    container.textContent = "태그를 선택하면 미리보기가 나타납니다.";
    return;
  }

  container.replaceChildren(createTagElement(draft));
}
