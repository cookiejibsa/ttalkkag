// state.js — 선택 태그와 편집 중인 속성/내용 상태

/** @typedef {{ name: string, value: string }} DraftAttribute */
/** @typedef {{ tagId: string, category: string, needCloseTag: boolean, attributes: DraftAttribute[] }} DraftTag */

/** @type {DraftTag | null} */
let selectedTag = null;
/** 사용자가 직접 추가할 수 있는 속성의 최대 개수 */
export const MAX_CUSTOM_ATTRIBUTES = 3;

/** @type {(DraftAttribute & { custom?: boolean })[]} */
let draftAttributes = [];
let draftText = "";
let customCount = 0;

/** @param {DraftTag} tag */
export function selectTag(tag) {
  selectedTag = tag;
  draftAttributes = tag.attributes.map(({ name, value }) => ({ name, value }));
  draftText = "";
  customCount = 0;
  return getDraft();
}

/** @param {number} index @param {string} name */
export function setAttributeName(index, name) {
  if (draftAttributes[index]) draftAttributes[index].name = name;
}

/** @param {number} index @param {string} value */
export function setAttributeValue(index, value) {
  if (draftAttributes[index]) draftAttributes[index].value = value;
}

/** 빈 사용자 속성을 추가한다. 이미 최대 개수면 추가하지 않는다. @returns {boolean} 추가했는지 */
export function addAttribute() {
  if (customCount >= MAX_CUSTOM_ATTRIBUTES) return false;
  draftAttributes.push({ name: "data-name", value: "", custom: true });
  customCount++;
  return true;
}

/** @param {number} index */
export function removeAttribute(index) {
  const [removed] = draftAttributes.splice(index, 1);
  if (removed?.custom) customCount--;
}

/** @param {string} text */
export function setText(text) {
  draftText = text;
}

/** @returns {DraftTag & { text: string, customCount: number } | null} */
export function getDraft() {
  if (!selectedTag) return null;
  return {
    ...selectedTag,
    attributes: draftAttributes.map(({ name, value }) => ({ name, value })),
    text: draftText,
    customCount,
  };
}
