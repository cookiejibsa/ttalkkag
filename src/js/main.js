// main.js — 태그 선택, 속성 조립, 미리보기, 포인터 따라가기 연결
import { LoadAsync, Get } from "./util/data.js";
import { renderPalette } from "./ui/palette.js";
import { renderAttributes } from "./handler/attributesPanel.js";
import { renderCanvas } from "./ui/canvas.js";
import { startPointerFollowing } from "./placement.js";
import {
  addAttribute,
  getDraft,
  removeAttribute,
  selectTag,
  setAttributeName,
  setAttributeValue,
  setText,
} from "./state.js";

window.addEventListener("DOMContentLoaded", async () => {
  const categoryContainer = document.querySelector(".tag-category");
  const tagContainer = document.querySelector(".tag-chip");
  const attributesPanel = document.querySelector(".attr-panel");
  const previewContainer = document.querySelector(".tag-preview");
  const makeButton = document.querySelector(".make-action");

  if (!(categoryContainer instanceof HTMLElement)
    || !(tagContainer instanceof HTMLElement)
    || !(attributesPanel instanceof HTMLElement)
    || !(previewContainer instanceof HTMLElement)
    || !(makeButton instanceof HTMLButtonElement)) {
    console.error("태그 조립에 필요한 작업 화면 영역을 찾지 못했습니다.");
    return;
  }

  let placement = null;

  function updatePreview() {
    const draft = getDraft();
    renderCanvas(previewContainer, draft);
    if (placement && draft) placement.update(draft);
  }

  function renderAttributeEditor() {
    const draft = getDraft();
    if (!draft) return;

    renderAttributes(
      attributesPanel,
      draft,
      (index, key, value) => {
        if (key === "name") setAttributeName(index, value);
        else setAttributeValue(index, value);
        updatePreview();
      },
      (value) => {
        setText(value);
        updatePreview();
      },
      () => {
        addAttribute();
        renderAttributeEditor();
        updatePreview();
      },
      (index) => {
        removeAttribute(index);
        renderAttributeEditor();
        updatePreview();
      },
    );
  }

  const loaded = await LoadAsync();
  const tags = Get();
  if (!loaded || tags.length === 0) {
    categoryContainer.textContent = "태그 데이터를 불러오지 못했습니다.";
    return;
  }

  renderPalette(categoryContainer, tagContainer, tags, (tag) => {
    selectTag(tag);
    renderAttributeEditor();
    updatePreview();
  });

  makeButton.addEventListener("click", (event) => {
    const draft = getDraft();
    if (!draft) return;

    placement?.cancel();
    placement = startPointerFollowing(draft, event);
  });
});
