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

  // 포인터 아래 요소를 찾아 그 위(before) 또는 아래(after)에 넣는다
  // 빈 곳이면 첫 요소보다 위일 때 맨 앞, 아니면 맨 끝
  function findDropTarget(event) {
    const doc = previewFrame?.contentDocument;
    if (!doc?.body) return null;

    const frameRect = previewFrame.getBoundingClientRect();
    const y = event.clientY - frameRect.top;
    const target = doc.elementFromPoint(event.clientX - frameRect.left, y);

    if (!target || target === doc.body || target === doc.documentElement) {
      const first = doc.body.firstElementChild;
      if (first && y < first.getBoundingClientRect().top) {
        return { doc, frameRect, anchor: first, before: true };
      }
      return { doc, frameRect, anchor: doc.body.lastElementChild, before: false, append: true };
    }

    const rect = target.getBoundingClientRect();
    return { doc, frameRect, anchor: target, before: y < rect.top + rect.height / 2 };
  }

  function showInsertLine(event) {
    const drop = findDropTarget(event);
    if (!drop || !renderPane) return;

    const paneRect = renderPane.getBoundingClientRect();
    const bodyRect = drop.doc.body.getBoundingClientRect();
    let top = bodyRect.top;
    if (drop.anchor) {
      const rect = drop.anchor.getBoundingClientRect();
      top = drop.before ? rect.top : rect.bottom;
    }

    insertLine.style.top = `${drop.frameRect.top - paneRect.top + top}px`;
    insertLine.style.left = `${drop.frameRect.left - paneRect.left + bodyRect.left}px`;
    insertLine.style.width = `${bodyRect.width}px`;
    insertLine.classList.add("is-visible");
  }

  // 표시선 자리에 태그를 넣고, 미리보기와 코드를 다시 그린다
  function placeIntoPreview(draft, event) {
    const drop = findDropTarget(event);
    const page = window.ttalkkagDocument;
    if (!drop || !page) return;

    const element = createTagElement(draft);
    element.removeAttribute("data-ddalkkak-preview");

    if (drop.append || !drop.anchor) {
      drop.doc.body.insertAdjacentHTML("beforeend", element.outerHTML);
    } else {
      drop.anchor.insertAdjacentHTML(drop.before ? "beforebegin" : "afterend", element.outerHTML);
    }

    page.setHtml(`<!doctype html>\n${drop.doc.documentElement.outerHTML}`);
  }

  // 렌더링부 요소: 마우스를 올리면 테두리와 삭제 버튼, 잡고 끌면 그 자리에서 바로 옮기기
  const hoverBox = document.createElement("div");
  hoverBox.className = "select-box";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "select-delete";
  deleteButton.textContent = "×";
  deleteButton.title = "삭제";
  deleteButton.setAttribute("aria-label", "이 요소 삭제");
  hoverBox.append(deleteButton);
  renderPane?.append(hoverBox);

  let hovered = null;
  let hideTimer = null;
  let moving = null;

  function hideHover() {
    hovered = null;
    hoverBox.classList.remove("is-visible");
  }

  function clearSelection() {
    clearTimeout(hideTimer);
    hideHover();
  }

  // 삭제 버튼으로 마우스를 옮기는 사이에 사라지지 않도록 잠깐 기다렸다가 숨긴다
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHover, 200);
  }

  function showHover(element) {
    if (!renderPane || !previewFrame || !element?.isConnected) return;
    clearTimeout(hideTimer);
    hovered = element;

    const paneRect = renderPane.getBoundingClientRect();
    const frameRect = previewFrame.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    hoverBox.style.top = `${frameRect.top - paneRect.top + rect.top}px`;
    hoverBox.style.left = `${frameRect.left - paneRect.left + rect.left}px`;
    hoverBox.style.width = `${rect.width}px`;
    hoverBox.style.height = `${rect.height}px`;
    hoverBox.classList.add("is-visible");
  }

  // 미리보기 안 좌표를 바깥 화면 좌표로 바꾼다 (표시선·놓을 자리 계산에 사용)
  function toPageEvent(event) {
    const frameRect = previewFrame.getBoundingClientRect();
    return { clientX: frameRect.left + event.clientX, clientY: frameRect.top + event.clientY };
  }

  function attachPreviewEvents() {
    const doc = previewFrame?.contentDocument;
    if (!doc?.documentElement) return;
    const isContent = (target) => target && target.nodeType === 1 && target !== doc.body && target !== doc.documentElement;

    // 글자 선택·끌기와 링크 이동은 막는다
    doc.addEventListener("selectstart", (event) => event.preventDefault());
    doc.addEventListener("dragstart", (event) => event.preventDefault());
    doc.addEventListener("click", (event) => event.preventDefault());

    doc.addEventListener("pointerover", (event) => {
      if (moving) return;
      if (isContent(event.target)) showHover(event.target);
      else scheduleHide();
    });
    doc.documentElement.addEventListener("pointerleave", () => {
      if (!moving) scheduleHide();
    });
    doc.defaultView?.addEventListener("scroll", () => {
      if (hovered) showHover(hovered);
    });

    doc.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !isContent(event.target)) return;
      event.preventDefault();
      moving = { element: event.target, startX: event.clientX, startY: event.clientY, started: false };
      event.target.setPointerCapture?.(event.pointerId);
    });

    doc.addEventListener("pointermove", (event) => {
      if (!moving) return;
      if (!moving.started) {
        if (Math.hypot(event.clientX - moving.startX, event.clientY - moving.startY) < 5) return;
        moving.started = true;
        renderPane?.classList.add("is-moving");
        clearSelection();
      }
      showInsertLine(toPageEvent(event));
    });

    const finishMove = (event, drop) => {
      if (!moving) return;
      const { element, started } = moving;
      moving = null;
      renderPane?.classList.remove("is-moving");
      insertLine.classList.remove("is-visible");
      if (!started || !drop) return;

      const page = window.ttalkkagDocument;
      const target = findDropTarget(toPageEvent(event));
      if (!page || !target) return;
      if (target.anchor && (target.anchor === element || element.contains(target.anchor))) return;

      if (target.append || !target.anchor) doc.body.append(element);
      else if (target.before) target.anchor.before(element);
      else target.anchor.after(element);

      page.setHtml(`<!doctype html>\n${doc.documentElement.outerHTML}`);
    };

    doc.addEventListener("pointerup", (event) => finishMove(event, true));
    doc.addEventListener("pointercancel", (event) => finishMove(event, false));
  }

  previewFrame?.addEventListener("load", attachPreviewEvents);
  attachPreviewEvents();

  deleteButton.addEventListener("pointerenter", () => clearTimeout(hideTimer));
  deleteButton.addEventListener("pointerleave", scheduleHide);
  deleteButton.addEventListener("click", () => {
    const doc = previewFrame?.contentDocument;
    const page = window.ttalkkagDocument;
    if (!hovered || !doc || !page) return;

    hovered.remove();
    clearSelection();
    page.setHtml(`<!doctype html>\n${doc.documentElement.outerHTML}`);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearSelection();
  });

  makeButton.addEventListener("click", (event) => {
    const draft = getDraft();
    if (!draft) return;

    stopPlacing();
    clearSelection();
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

  // 태그 미리보기를 끌어다 렌더링부에 놓으면 바로 배치
  let dragging = false;

  previewContainer.addEventListener("pointerdown", (event) => {
    const draft = getDraft();
    if (!draft || event.button !== 0) return;

    event.preventDefault();
    stopPlacing();
    clearSelection();
    placement = startPointerFollowing(draft, event);
    renderPane?.classList.add("is-placing");
    dragging = true;
  });

  document.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;

    const paneRect = renderPane?.getBoundingClientRect();
    const droppedOnPane = paneRect
      && event.clientX >= paneRect.left && event.clientX <= paneRect.right
      && event.clientY >= paneRect.top && event.clientY <= paneRect.bottom;

    const draft = getDraft();
    if (droppedOnPane && draft) placeIntoPreview(draft, event);
    stopPlacing();
  });
});
