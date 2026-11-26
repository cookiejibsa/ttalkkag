// palette.js — 카테고리 필터링 + 태그 선택 UI

/**
 * 태그 목록을 표시하고 선택 결과를 콜백으로 전달합니다.
 * @param {HTMLElement} categoryContainer
 * @param {HTMLElement} tagContainer
 * @param {Array<{ tagId: string, category: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }> }>} tags
 * @param {(tag: { tagId: string, category: string, needCloseTag: boolean, attributes: Array<{ name: string, value: string }> }) => void} onSelect
 */
export function renderPalette(categoryContainer, tagContainer, tags, onSelect) {
  if (!categoryContainer || !tagContainer || tags.length === 0) return;

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
        const firstTagInCategory = tags.find((tag) => tag.category === category);
        selectedTagId = firstTagInCategory?.tagId ?? "";
        renderCategories();
        renderTags();
        if (firstTagInCategory) onSelect(firstTagInCategory);
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
        button.setAttribute("aria-pressed", String(tag.tagId === selectedTagId));
        button.addEventListener("click", () => {
          selectedTagId = tag.tagId;
          renderTags();
          onSelect(tag);
        });
        tagContainer.append(button);
      });
  }

  renderCategories();
  renderTags();
  const firstTag = tags.find((tag) => tag.category === activeCategory);
  if (firstTag) {
    selectedTagId = firstTag.tagId;
    renderTags();
    onSelect(firstTag);
  }
}
