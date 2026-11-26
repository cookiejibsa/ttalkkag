// main.js — 태그 선택, 속성 조립, 미리보기, 포인터 따라가기 연결
import { LoadAsync, Get } from "./util/data.js";
import { renderPalette } from "./ui/palette.js";
import { renderAttributes } from "./handler/attributesPanel.js";
import { renderCanvas, createTagElement } from "./ui/canvas.js";
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

  const renderPane = document.querySelector(".render-pane");
  const previewFrame = document.querySelector("#html-preview");

  // 배치 위치 표시선
  const insertLine = document.createElement("div");
  insertLine.className = "insert-line";
  renderPane?.append(insertLine);

  function stopPlacing() {
    placement?.cancel();
    placement = null;
    renderPane?.classList.remove("is-placing");
    insertLine.classList.remove("is-visible");
  }

  // 포인터 아래 요소를 찾는다. 그 요소 바로 뒤가 태그가 들어갈 자리 (없으면 body 맨 끝)
  function findDropTarget(event) {
    const doc = previewFrame?.contentDocument;
    if (!doc?.body) return null;
    const frameRect = previewFrame.getBoundingClientRect();
    const target = doc.elementFromPoint(event.clientX - frameRect.left, event.clientY - frameRect.top);
    const isPageRoot = !target || target === doc.body || target === doc.documentElement;
    return { doc, frameRect, target: isPageRoot ? null : target };
  }

  function showInsertLine(event) {
    const drop = findDropTarget(event);
    if (!drop || !renderPane) return;

    const paneRect = renderPane.getBoundingClientRect();
    const anchor = drop.target || drop.doc.body.lastElementChild;
    const bodyRect = drop.doc.body.getBoundingClientRect();
    const rect = anchor ? anchor.getBoundingClientRect() : bodyRect;
    const top = anchor ? rect.bottom : bodyRect.top;

    insertLine.style.top = `${drop.frameRect.top - paneRect.top + top}px`;
    insertLine.style.left = `${drop.frameRect.left - paneRect.left + bodyRect.left}px`;
    insertLine.style.width = `${bodyRect.width}px`;
    insertLine.classList.add("is-visible");
  }

  // 렌더링부에서 누른 자리 바로 뒤에 태그를 넣고, 미리보기와 코드를 다시 그린다
  function placeIntoPreview(draft, event) {
    const doc = previewFrame?.contentDocument;
    const page = window.ttalkkagDocument;
    if (!doc?.body || !page) return;

    const element = createTagElement(draft);
    element.removeAttribute("data-ddalkkak-preview");

    const { target } = findDropTarget(event);

    if (!target) {
      doc.body.insertAdjacentHTML("beforeend", element.outerHTML);
    } else {
      target.insertAdjacentHTML("afterend", element.outerHTML);
    }

    page.setHtml(`<!doctype html>\n${doc.documentElement.outerHTML}`);
  }

  makeButton.addEventListener("click", (event) => {
    const draft = getDraft();
    if (!draft) return;

    stopPlacing();
    placement = startPointerFollowing(draft, event);
    renderPane?.classList.add("is-placing");
  });

  renderPane?.addEventListener("pointermove", (event) => {
    if (placement) showInsertLine(event);
  });

  renderPane?.addEventListener("pointerleave", () => {
    insertLine.classList.remove("is-visible");
  });

  renderPane?.addEventListener("click", (event) => {
    if (!placement) return;
    const draft = getDraft();
    if (draft) placeIntoPreview(draft, event);
    stopPlacing();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") stopPlacing();
  });
});
