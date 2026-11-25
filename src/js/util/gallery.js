// gallery.js — localStorage의 프로젝트를 대시보드 카드로 표시합니다.
import { Load, ItemType } from "./storage.js";

const gallery = document.querySelector(".gallery");

/** @typedef {{ name: string, updatedAt: string, html: string }} Project */

// 저장된 프로젝트 값을 배열로 변환하고 잘못된 항목을 제외합니다.
function loadProjects() {
    const storedProjects = Load(ItemType.Projects);
    if (!storedProjects) return [];

    try {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed)) {
            return parsed.filter(isProject);
        }
    } catch {
        // 이전 저장 방식으로 기록된 데이터도 아래에서 읽을 수 있도록 처리합니다.
    }

    // 구분자로 나뉜 저장 항목 중 프로젝트 JSON만 복구합니다.
    return storedProjects.split("$$").flatMap((item) => {
        try {
            const parsed = JSON.parse(item);
            return isProject(parsed) ? [parsed] : [];
        } catch {
            return [];
        }
    });
}

// 값이 프로젝트 이름, 수정 시각, HTML 소스를 가진 객체인지 확인합니다.
function isProject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        typeof value.name === "string" &&
        typeof value.updatedAt === "string" &&
        typeof value.html === "string"
    );
}

// 수정 시각을 대시보드에 표시할 날짜와 시간으로 바꿉니다.
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

// 프로젝트 카드에 이름, 수정 시각, HTML 미리보기를 채웁니다.
function renderProject(project, template, index) {
    const card = template.cloneNode(true);
    const name = card.querySelector(".card-name");
    const date = card.querySelector(".card-date");
    const thumbnail = card.querySelector(".card-thumb");

    card.dataset.projectIndex = String(index);
    if (name) name.textContent = project.name || "이름 없는 프로젝트";
    if (date) date.textContent = `마지막 수정 ${formatDate(project.updatedAt)}`;

    if (thumbnail) {
        const preview = document.createElement("iframe");
        preview.title = `${project.name || "프로젝트"} 미리보기`;
        preview.setAttribute("sandbox", "");
        preview.srcdoc = project.html;
        thumbnail.replaceChildren(preview);
    }

    return card;
}

// 예시 카드를 복제해 프로젝트를 렌더링하고 새 프로젝트 버튼을 마지막에 둡니다.
function renderGallery() {
    if (!gallery) return;

    const exampleCard = gallery.querySelector(".project-card:not(.new-card)");
    const newProjectCard = gallery.querySelector(".new-card");
    if (!exampleCard || !newProjectCard) return;

    const projects = loadProjects();
    gallery.replaceChildren();

    // 저장된 프로젝트를 순서대로 카드로 만들어 갤러리에 추가합니다.
    projects.forEach((project, index) => {
        gallery.append(renderProject(project, exampleCard, index));
    });
    gallery.append(newProjectCard);
}

// 대시보드 문서가 준비되면 저장된 프로젝트 목록을 표시합니다.
if (gallery) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderGallery, { once: true });
    } else {
        renderGallery();
    }
}
