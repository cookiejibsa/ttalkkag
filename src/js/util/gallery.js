// gallery.js — localStorage의 프로젝트를 대시보드 카드로 생성합니다.
import { Load, ItemType } from "./storage.js";

const gallery = document.querySelector(".gallery");

/** @typedef {{ name: string, updatedAt: string, html: string }} Project */

// 저장된 프로젝트 값을 배열로 읽고 프로젝트 형식이 아닌 항목은 제외합니다.
function loadProjects() {
    const storedProjects = Load(ItemType.Projects);
    if (!storedProjects) return [];

    try {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed)) return parsed.filter(isProject);
    } catch {
        // 예전 구분자 저장 형식을 아래에서 읽습니다.
    }

    // 구분자로 분리된 항목 중 유효한 프로젝트 JSON만 반환합니다.
    return storedProjects.split("$$").flatMap((item) => {
        try {
            const parsed = JSON.parse(item);
            return isProject(parsed) ? [parsed] : [];
        } catch {
            return [];
        }
    });
}

// 값이 이름, 최종 수정 시각, HTML 소스를 갖춘 프로젝트인지 확인합니다.
function isProject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        typeof value.name === "string" &&
        typeof value.updatedAt === "string" &&
        typeof value.html === "string"
    );
}

// 프로젝트 수정 시각을 한국어 날짜와 시간으로 표시합니다.
function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "마지막 수정 시각 없음";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

// 프로젝트를 목록에서 지우고 갤러리와 프로젝트 수를 다시 그립니다.
function deleteProject(index) {
    const projects = loadProjects();
    const [removed] = projects.splice(index, 1);
    if (!removed) return;
    if (!confirm(`"${removed.name || "이름 없는 프로젝트"}" 프로젝트를 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return;

    localStorage.setItem(ItemType.Projects, JSON.stringify(projects));
    renderGallery();

    const projectsStat = document.querySelector('[data-stat="projects"]');
    if (projectsStat) projectsStat.textContent = String(projects.length);
}

// 프로젝트 정보를 사용해 카드와 격리된 HTML 미리보기를 생성합니다.
function createProjectCard(project, index) {
    const wrap = document.createElement("div");
    wrap.className = "project-card-wrap";

    const card = document.createElement("a");
    card.className = "project-card";
    card.href = `workspace.html?project=${encodeURIComponent(project.name)}`;
    card.dataset.projectIndex = String(index);

    const thumbnail = document.createElement("div");
    thumbnail.className = "card-thumb";

    const preview = document.createElement("iframe");
    preview.title = `${project.name || "프로젝트"} 미리보기`;
    preview.setAttribute("sandbox", "");
    preview.srcdoc = project.html;
    thumbnail.append(preview);

    const metadata = document.createElement("div");
    metadata.className = "card-meta";

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = project.name || "이름 없는 프로젝트";

    const date = document.createElement("div");
    date.className = "card-date";
    date.textContent = `마지막 수정 ${formatDate(project.updatedAt)}`;

    metadata.append(name, date);
    card.append(thumbnail, metadata);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-delete";
    deleteButton.textContent = "×";
    deleteButton.title = "프로젝트 삭제";
    deleteButton.setAttribute("aria-label", `${project.name || "이름 없는"} 프로젝트 삭제`);
    deleteButton.addEventListener("click", () => deleteProject(index));

    wrap.append(card, deleteButton);
    return wrap;
}

// 새 워크스페이스를 열 수 있는 갤러리 마지막 카드를 생성합니다.
function createNewProjectCard() {
    const card = document.createElement("a");
    card.className = "project-card new-card";
    card.href = "workspace.html";
    card.dataset.action = "new-project";

    const icon = document.createElement("img");
    icon.className = "new-card-icon";
    icon.src = "../../assets/icons/plus.svg";
    icon.alt = "";

    const label = document.createElement("span");
    label.textContent = "새 프로젝트";
    card.append(icon, label);
    return card;
}

// 저장된 프로젝트 카드를 모두 만든 뒤 새 프로젝트 카드를 맨 끝에 추가합니다.
function renderGallery() {
    if (!gallery) return;

    const projects = loadProjects();
    const cards = projects.map((project, index) => createProjectCard(project, index));
    cards.push(createNewProjectCard());
    gallery.replaceChildren(...cards);
}

// 문서가 준비되면 로컬 프로젝트 목록을 갤러리에 표시합니다.
if (gallery) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderGallery, { once: true });
    } else {
        renderGallery();
    }
}