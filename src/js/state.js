// state.js — 선택 태그와 편집 중인 속성/내용 상태

/** @typedef {{ name: string, value: string }} DraftAttribute */
/** @typedef {{ tagId: string, category: string, needCloseTag: boolean, attributes: DraftAttribute[] }} DraftTag */

/** @type {DraftTag | null} */
let selectedTag = null;
/** @type {DraftAttribute[]} */
let draftAttributes = [];
let draftText = "";

/** @param {DraftTag} tag */
export function selectTag(tag) {
  selectedTag = tag;
  draftAttributes = tag.attributes.map(({ name, value }) => ({ name, value }));
  draftText = "";
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

/** Add an empty custom data attribute. */
export function addAttribute() {
  draftAttributes.push({ name: "data-name", value: "" });
}

/** @param {number} index */
export function removeAttribute(index) {
  draftAttributes.splice(index, 1);
}

/** @param {string} text */
export function setText(text) {
  draftText = text;
}

/** @returns {DraftTag & { text: string } | null} */
export function getDraft() {
  if (!selectedTag) return null;
  return {
    ...selectedTag,
    attributes: draftAttributes.map(({ name, value }) => ({ name, value })),
    text: draftText,
  };
}
