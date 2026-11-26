// palette.js — 카테고리 필터링, 클릭 선택, 태그 드래그 및 드롭

/**
 * @typedef {{ tagId: string, category: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }> }} PaletteTag
 * @param {HTMLElement} categoryContainer
 * @param {HTMLElement} tagContainer
 * @param {PaletteTag[]} tags
 * @param {(tag: PaletteTag) => void} onSelect
 * @param {HTMLElement[]} dropTargets
 */
export function renderPalette(categoryContainer, tagContainer, tags, onSelect, dropTargets = []) {
  if (!categoryContainer || !tagContainer || tags.length === 0) {
    return { select: () => false, clear: () => false };
  }

  const categories = [...new Set(tags.map((tag) => tag.category))];
  let activeCategory = categories[0];
  let selectedTagId = "";

  function renderCategories() {
    categoryContainer.replaceChildren();
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tag-category-button";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        const firstTag = tags.find((tag) => tag.category === category);
        if (firstTag) selectTag(firstTag.tagId, true);
        else {
          selectedTagId = "";
          renderCategories();
          renderTags();
        }
      });
      categoryContainer.append(button);
    });
  }

  function renderTags() {
    tagContainer.replaceChildren();
    tags
      .filter((tag) => tag.category === activeCategory)
      .forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tag-chip-button";
        button.textContent = `<${tag.tagId}>`;
        button.draggable = true;
        button.setAttribute("aria-pressed", String(tag.tagId === selectedTagId));
        button.setAttribute("aria-label", `<${tag.tagId}> 태그 선택 또는 드래그`);
        button.addEventListener("click", () => selectTag(tag.tagId, true));
        button.addEventListener("dragstart", (event) => {
          if (!event.dataTransfer) return;
          event.dataTransfer.setData("text/plain", tag.tagId);
          event.dataTransfer.effectAllowed = "copy";
          button.classList.add("is-dragging");
        });
        button.addEventListener("dragend", () => {
          button.classList.remove("is-dragging");
          dropTargets.forEach((target) => target.classList.remove("is-drop-target-active"));
        });
        tagContainer.append(button);
      });
  }

  function selectTag(tagId, focusSelection = false) {
    const tag = tags.find((item) => item.tagId === tagId);
    if (!tag) return false;
    activeCategory = tag.category;
    selectedTagId = tag.tagId;
    renderCategories();
    renderTags();
    if (focusSelection) {
      tagContainer.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    }
    onSelect(tag);
    return true;
  }

  function clearSelection() {
    selectedTagId = "";
    renderCategories();
    renderTags();
  }

  dropTargets.forEach((target) => {
    target.addEventListener("dragenter", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("text/plain")) return;
      event.preventDefault();
      target.classList.add("is-drop-target-active");
    });
    target.addEventListener("dragover", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("text/plain")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      target.classList.add("is-drop-target-active");
    });
    target.addEventListener("dragleave", (event) => {
      if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
      target.classList.remove("is-drop-target-active");
    });
    target.addEventListener("drop", (event) => {
      event.preventDefault();
      target.classList.remove("is-drop-target-active");
      const tagId = event.dataTransfer?.getData("text/plain");
      if (tagId) selectTag(tagId);
    });
  });

  renderCategories();
  const firstTag = tags.find((tag) => tag.category === activeCategory);
  if (firstTag) selectTag(firstTag.tagId);
  return { select: selectTag, clear: clearSelection };
}
