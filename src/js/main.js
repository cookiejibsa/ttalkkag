// main.js — 태그 선택/드롭, 속성 조립, 미리보기 및 제작 연결
import { LoadAsync, Get } from "./util/data.js";
import { renderPalette } from "./ui/palette.js";
import { renderAttributes } from "./handler/attributesPanel.js";
import { renderCanvas } from "./ui/canvas.js";
import { startPointerFollowing } from "./placement.js";
import {
  addAttribute,
  clearDraft,
  getDraft,
  removeAttribute,
  restoreDraft,
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
  let palette = null;

  function publishDraft() {
    window.dispatchEvent(new CustomEvent("ddalkkak:draft-change", {
      detail: { draft: getDraft() },
    }));
  }

  function updatePreview() {
    const draft = getDraft();
    renderCanvas(previewContainer, draft);
    makeButton.disabled = !draft;
    if (placement && draft) placement.update(draft);
    publishDraft();
  }

  function renderAttributeEditor() {
    const draft = getDraft();
    if (!draft) {
      attributesPanel.textContent = "태그를 클릭하거나 여기에 드롭해 선택하세요.";
      return;
    }

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

  function showDraft(draft) {
    if (draft?.tagId && palette?.select(draft.tagId)) {
      restoreDraft(draft);
    } else {
      clearDraft();
      palette?.clear();
    }
    renderAttributeEditor();
    renderCanvas(previewContainer, getDraft());
    makeButton.disabled = !getDraft();
    publishDraft();
  }

  const loaded = await LoadAsync();
  const tags = Get();
  if (!loaded || tags.length === 0) {
    categoryContainer.textContent = "태그 데이터를 불러오지 못했습니다.";
    attributesPanel.textContent = "태그 목록을 사용할 수 없습니다.";
    return;
  }

  palette = renderPalette(
    categoryContainer,
    tagContainer,
    tags,
    (tag) => {
      selectTag(tag);
      renderAttributeEditor();
      updatePreview();
    },
    [attributesPanel, previewContainer],
  );

  window.addEventListener("ddalkkak:project-load", (event) => {
    const draft = event.detail?.draft;
    if (draft && tags.some((tag) => tag.tagId === draft.tagId)) {
      showDraft(draft);
    } else {
      clearDraft();
      palette.clear();
      renderAttributeEditor();
      renderCanvas(previewContainer, null);
      makeButton.disabled = true;
    }
  });

  window.addEventListener("ddalkkak:project-reset", () => {
    placement?.cancel();
    placement = null;
    clearDraft();
    palette.clear();
    renderAttributeEditor();
    renderCanvas(previewContainer, null);
    makeButton.disabled = true;
  });

  makeButton.addEventListener("click", (event) => {
    const draft = getDraft();
    if (!draft) return;
    placement?.cancel();
    placement = startPointerFollowing(draft, event);
  });
});
