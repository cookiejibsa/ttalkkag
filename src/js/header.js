// header.js — 미리보기/내보내기 및 프로젝트 메뉴 기능
import { Generate } from "./util/codeGenerator.js";
import { renderCodeview } from "./ui/codeview.js";
import { LoadProjects, SaveProjects } from "./util/storage.js";

const menuWrap = document.querySelector(".menu-wrap");
const menuToggle = document.querySelector('[data-action="menu-toggle"]');
const projectMenu = document.querySelector("#project-menu");
const nameInput = document.querySelector("#project-name");
const preview = document.querySelector("#html-preview");
const codeOutput = document.querySelector("#code-output");
const lineNumbers = document.querySelector("#line-numbers");
const copyMessage = document.querySelector("#copy-message");
const loadDialog = document.querySelector("#load-project-dialog");
const savedProjectsSelect = document.querySelector("#saved-projects");
const loadEmptyMessage = document.querySelector("#load-empty-message");
const loadConfirm = document.querySelector('[data-action="load-confirm"]');

let currentDraft = null;
let currentHtml = Generate(null);
let projectsForDialog = [];
let loadedLegacyHtml = false;

function renderOutput() {
  if (currentDraft) currentHtml = Generate(currentDraft, nameInput?.value ?? "Document");
  if (preview) preview.srcdoc = currentHtml;
  renderCodeview(codeOutput, lineNumbers, currentHtml);
}

function showMessage(message) {
  if (!copyMessage) return;
  copyMessage.textContent = message;
  copyMessage.classList.remove("show");
  void copyMessage.offsetWidth;
  copyMessage.classList.add("show");
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!projectMenu || !menuToggle) return;
  projectMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "프로젝트 메뉴 열기");
  if (restoreFocus) menuToggle.focus();
}

function openLoadDialog() {
  if (!(loadDialog instanceof HTMLDialogElement)
    || !(savedProjectsSelect instanceof HTMLSelectElement)) return;

  try {
    projectsForDialog = LoadProjects();
  } catch (error) {
    console.error("저장된 프로젝트를 읽지 못했습니다.", error);
    projectsForDialog = [];
  }

  savedProjectsSelect.replaceChildren();
  projectsForDialog.forEach((project, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = project.name || "이름 없는 프로젝트";
    savedProjectsSelect.append(option);
  });

  const hasProjects = projectsForDialog.length > 0;
  savedProjectsSelect.disabled = !hasProjects;
  if (loadConfirm instanceof HTMLButtonElement) loadConfirm.disabled = !hasProjects;
  if (loadEmptyMessage) loadEmptyMessage.hidden = hasProjects;
  loadDialog.showModal();
}

function saveCurrentProject() {
  const name = nameInput?.value.trim() || "이름 없는 프로젝트";
  const now = new Date().toISOString();
  const record = {
    name,
    updatedAt: now,
    html: currentHtml,
    ...(currentDraft ? { draft: structuredClone(currentDraft) } : {}),
  };

  try {
    const projects = LoadProjects();
    const existingIndex = projects.findIndex(
      (project) => project.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (existingIndex >= 0) projects[existingIndex] = record;
    else projects.push(record);
    SaveProjects(projects);
    showMessage("프로젝트를 저장했습니다.");
  } catch (error) {
    console.error("프로젝트를 저장하지 못했습니다.", error);
    showMessage("저장 공간을 사용할 수 없습니다.");
  }
}

function loadSelectedProject() {
  const index = Number(savedProjectsSelect?.value);
  const project = projectsForDialog[index];
  if (!project) return;

  if (nameInput) nameInput.value = project.name;
  currentDraft = project.draft && typeof project.draft === "object" ? project.draft : null;
  loadedLegacyHtml = !currentDraft;
  currentHtml = project.html;

  window.dispatchEvent(new CustomEvent("ddalkkak:project-load", {
    detail: { draft: currentDraft },
  }));
  renderOutput();
  loadDialog?.close();
  showMessage("프로젝트를 불러왔습니다.");
}

function createHtmlBlob() {
  const title = nameInput?.value.trim() || "Document";
  const filename = title.replace(/[\\/:*?"<>|]/g, "_");
  return {
    filename,
    blob: new Blob([currentHtml], { type: "text/html;charset=utf-8" }),
  };
}

renderOutput();

window.addEventListener("ddalkkak:draft-change", (event) => {
  currentDraft = event.detail?.draft ?? null;
  loadedLegacyHtml = false;
  renderOutput();
});

nameInput?.addEventListener("input", () => {
  if (!loadedLegacyHtml) renderOutput();
});

menuToggle?.addEventListener("click", () => {
  if (!projectMenu) return;
  const shouldOpen = projectMenu.hidden;
  projectMenu.hidden = !shouldOpen;
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuToggle.setAttribute("aria-label", shouldOpen ? "프로젝트 메뉴 닫기" : "프로젝트 메뉴 열기");
});

projectMenu?.addEventListener("click", (event) => {
  const actionButton = event.target instanceof Element
    ? event.target.closest("button[data-action]")
    : null;
  const action = actionButton?.getAttribute("data-action");
  if (!action) return;
  closeMenu();

  if (action === "save") {
    saveCurrentProject();
  } else if (action === "load") {
    openLoadDialog();
  } else if (action === "reset") {
    if (!window.confirm("현재 작업을 초기화할까요? 저장한 프로젝트는 삭제되지 않습니다.")) return;
    if (nameInput) nameInput.value = "";
    currentDraft = null;
    loadedLegacyHtml = false;
    currentHtml = Generate(null);
    renderOutput();
    window.dispatchEvent(new CustomEvent("ddalkkak:project-reset"));
    showMessage("현재 작업을 초기화했습니다.");
  }
});

document.addEventListener("pointerdown", (event) => {
  if (menuWrap && event.target instanceof Node && !menuWrap.contains(event.target)) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectMenu && !projectMenu.hidden) {
    closeMenu({ restoreFocus: true });
  }
});

document.querySelector('[data-action="preview"]')?.addEventListener("click", () => {
  const { blob } = createHtmlBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
});

document.querySelector('[data-action="export"]')?.addEventListener("click", () => {
  const { filename, blob } = createHtmlBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelector('[data-action="copy-code"]')?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentHtml);
    showMessage("코드를 복사했습니다.");
  } catch (error) {
    console.error("코드를 복사하지 못했습니다.", error);
    showMessage("복사에 실패했습니다.");
  }
});

document.querySelector('[data-action="load-cancel"]')?.addEventListener("click", () => loadDialog?.close());
loadConfirm?.addEventListener("click", loadSelectedProject);

loadDialog?.addEventListener("click", (event) => {
  if (event.target === loadDialog) loadDialog.close();
});
