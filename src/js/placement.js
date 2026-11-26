// placement.js — 제작한 태그를 포인터에 붙여 이동
import { createTagElement } from "./ui/canvas.js";

/**
 * 제작 미리보기 고스트를 포인터에 붙입니다. Escape를 누르면 따라다니기를 취소합니다.
 * @param {Parameters<typeof createTagElement>[0]} draft
 * @param {{ clientX: number, clientY: number }} initialPointer
 * @returns {{ update: (nextDraft: Parameters<typeof createTagElement>[0]) => void, cancel: () => void }}
 */
export function startPointerFollowing(draft, initialPointer) {
  document.querySelector(".placement-ghost")?.remove();

  let active = true;
  let pointer = { x: initialPointer.clientX, y: initialPointer.clientY };
  let ghost = createGhost(draft);
  document.body.append(ghost);
  moveGhost();

  function createGhost(nextDraft) {
    const element = createTagElement(nextDraft);
    element.classList.add("placement-ghost");
    element.setAttribute("aria-hidden", "true");
    // Keep cursor following functional even before workspace.html links canvas.css.
    Object.assign(element.style, {
      position: "fixed",
      zIndex: "10000",
      pointerEvents: "none",
      margin: "0",
      padding: "0.35rem 0.5rem",
      border: "1px dashed #ff2b2b",
      borderRadius: "0.25rem",
      background: "#141414",
      color: "#f2f2f2",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.35)",
      opacity: "0.82",
      overflowWrap: "anywhere",
    });
    return element;
  }

  function moveGhost() {
    ghost.style.left = `${pointer.x + 12}px`;
    ghost.style.top = `${pointer.y + 12}px`;
  }

  function handlePointerMove(event) {
    pointer = { x: event.clientX, y: event.clientY };
    moveGhost();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") cancel();
  }

  function cancel() {
    if (!active) return;
    active = false;
    ghost.remove();
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("keydown", handleKeyDown);
  }

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("keydown", handleKeyDown);

  return {
    update(nextDraft) {
      if (!active) return;
      const updatedGhost = createGhost(nextDraft);
      ghost.replaceWith(updatedGhost);
      ghost = updatedGhost;
      moveGhost();
    },
    cancel,
  };
}
