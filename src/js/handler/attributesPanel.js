// attributesPanel.js — 선택된 태그의 속성과 내용을 편집

/**
 * @param {HTMLElement} panel
 * @param {{ tagId: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }>, text: string }} tag
 * @param {(index: number, key: "name" | "value", value: string) => void} onAttributeChange
 * @param {(value: string) => void} onTextChange
 * @param {() => void} onAddAttribute
 * @param {(index: number) => void} onRemoveAttribute
 */
export function renderAttributes(panel, tag, onAttributeChange, onTextChange, onAddAttribute, onRemoveAttribute) {
  if (!panel || !tag) return;

  const heading = document.createElement("h2");
  heading.className = "attr-panel-title";
  heading.textContent = `<${tag.tagId}> 속성 조립`;

  const attributeList = document.createElement("div");
  attributeList.className = "attribute-editor-list";

  tag.attributes.forEach(({ name, value }, index) => {
    const row = document.createElement("div");
    row.className = "attribute-editor-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "attribute-name-input";
    nameInput.value = name;
    nameInput.placeholder = "속성 이름";
    nameInput.setAttribute("aria-label", `${index + 1}번째 속성 이름`);
    nameInput.autocomplete = "off";
    nameInput.addEventListener("input", () => onAttributeChange(index, "name", nameInput.value));

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "attribute-value-input";
    valueInput.value = value;
    valueInput.placeholder = "값";
    valueInput.setAttribute("aria-label", `${name || `${index + 1}번째`} 속성 값`);
    valueInput.autocomplete = "off";
    valueInput.addEventListener("input", () => onAttributeChange(index, "value", valueInput.value));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "attribute-remove-button";
    removeButton.textContent = "삭제";
    removeButton.setAttribute("aria-label", `${name || `${index + 1}번째`} 속성 삭제`);
    removeButton.addEventListener("click", () => onRemoveAttribute(index));

    row.append(nameInput, valueInput, removeButton);
    attributeList.append(row);
  });

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "attribute-add-button";
  addButton.textContent = "+ 사용자 속성 추가";
  addButton.addEventListener("click", onAddAttribute);

  const contentField = document.createElement("label");
  contentField.className = "tag-content-field";
  const contentLabel = document.createElement("span");
  contentLabel.textContent = tag.needCloseTag ? "태그 내용" : "이 태그는 내부 내용을 갖지 않습니다.";
  contentField.append(contentLabel);

  if (tag.needCloseTag) {
    const contentInput = document.createElement("textarea");
    contentInput.className = "tag-content-input";
    contentInput.value = tag.text;
    contentInput.placeholder = "태그 안에 표시할 내용을 입력하세요";
    contentInput.rows = 2;
    contentInput.addEventListener("input", () => onTextChange(contentInput.value));
    contentField.append(contentInput);
  }

  panel.setAttribute("aria-live", "polite");
  panel.replaceChildren(heading, attributeList, addButton, contentField);
}
