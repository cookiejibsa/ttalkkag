// attributesPanel.js — 선택된 태그의 속성과 내용을 편집

import { MAX_CUSTOM_ATTRIBUTES } from "../state.js";

/**
 * @param {HTMLElement} panel
 * @param {{ tagId: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }>, text: string, customCount: number }} tag
 * @param {(index: number, key: "name" | "value", value: string) => void} onAttributeChange
 * @param {(value: string) => void} onTextChange
 * @param {() => void} onAddAttribute
 * @param {(index: number) => void} onRemoveAttribute
 */
export function renderAttributes(panel, tag, onAttributeChange, onTextChange, onAddAttribute, onRemoveAttribute) {
  if (!panel || !tag) return;

  // 위쪽 한 줄: 제목 + 사용자 속성 추가 버튼
  const head = document.createElement("div");
  head.className = "attr-panel-head";

  const heading = document.createElement("h2");
  heading.className = "attr-panel-title";
  heading.textContent = `<${tag.tagId}> 속성 조립`;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "attribute-add-button";
  addButton.textContent = `+ 사용자 속성 ${tag.customCount}/${MAX_CUSTOM_ATTRIBUTES}`;
  addButton.disabled = tag.customCount >= MAX_CUSTOM_ATTRIBUTES;
  addButton.addEventListener("click", onAddAttribute);

  head.append(heading);

  // 속성 칸들: 이름="값" 모양으로 여러 칸에 나눠 한 화면에 모두 보이게
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
    nameInput.size = Math.max(name.length, 4);
    nameInput.setAttribute("aria-label", `${index + 1}번째 속성 이름`);
    nameInput.autocomplete = "off";
    nameInput.addEventListener("input", () => {
      nameInput.size = Math.max(nameInput.value.length, 4);
      onAttributeChange(index, "name", nameInput.value);
    });

    const equal = document.createElement("span");
    equal.className = "attribute-equal";
    equal.textContent = "=";

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
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `${name || `${index + 1}번째`} 속성 삭제`);
    removeButton.addEventListener("click", () => onRemoveAttribute(index));

    row.append(nameInput, equal, valueInput, removeButton);
    attributeList.append(row);
  });

  // 사용자 속성 추가 버튼: 속성 칸들 바로 옆에
  attributeList.append(addButton);

  // 태그 내용: 속성 칸들 아래, 제작부 바로 위에 한 줄 전체로
  const contentField = document.createElement("label");
  contentField.className = "tag-content-field";
  const contentLabel = document.createElement("span");
  contentLabel.className = "tag-content-label";
  contentField.append(contentLabel);

  if (tag.needCloseTag) {
    contentLabel.textContent = "내용";
    const contentInput = document.createElement("textarea");
    contentInput.rows = 2;
    contentInput.className = "tag-content-input";
    contentInput.value = tag.text;
    contentInput.placeholder = "태그 안에 표시할 내용";
    contentInput.addEventListener("input", () => onTextChange(contentInput.value));
    contentField.append(contentInput);
  } else {
    contentField.classList.add("is-empty");
    contentLabel.textContent = "이 태그는 안에 내용을 넣지 않아요";
  }

  panel.setAttribute("aria-live", "polite");
  panel.replaceChildren(head, attributeList, contentField);
}
