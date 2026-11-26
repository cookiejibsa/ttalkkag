// profile.js — 프로필과 방문 통계를 localStorage에 기록하고 대시보드에 표시합니다.
import { Load, Save, ItemType } from "./storage.js";

const imageInput = document.getElementById("imageInput");
const avatar = document.querySelector(".profile-avatar");
const nameInput = document.getElementById("profile-name");
const removeAvatarButton = document.getElementById("removeAvatar");
const EMPTY_AVATAR = "/assets/icons/avatar_empty.jpg";

// 현재 날짜를 브라우저의 현지 시간 기준 YYYY-MM-DD 형식으로 반환합니다.
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// 저장된 프로필 JSON을 읽고 사용할 수 있는 기본 구조를 반환합니다.
function loadProfile() {
    const savedProfile = Load(ItemType.Profile);
    if (!savedProfile) return {};

    try {
        const parsed = JSON.parse(savedProfile.split("$$")[0]);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        console.warn("저장된 프로필을 불러오지 못했습니다.", error);
        return {};
    }
}

// 프로필을 storage.js의 저장 형식에 맞춰 localStorage에 기록합니다.
function saveProfile(profile) {
    Save(ItemType.Profile, [JSON.stringify(profile)]);
}

// 방문 날짜 두 개 사이의 일수를 포함 기준으로 계산합니다.
function getDaysTogether(firstVisitDate, today) {
    const [firstYear, firstMonth, firstDay] = firstVisitDate.split("-").map(Number);
    const [currentYear, currentMonth, currentDay] = today.split("-").map(Number);
    const first = Date.UTC(firstYear, firstMonth - 1, firstDay);
    const current = Date.UTC(currentYear, currentMonth - 1, currentDay);
    if (!Number.isFinite(first) || !Number.isFinite(current)) return 1;
    return Math.max(1, Math.floor((current - first) / 86400000) + 1);
}

// 저장된 프로젝트 배열의 요소 수를 반환합니다.
function getProjectCount() {
    const storedProjects = Load(ItemType.Projects);
    if (!storedProjects) return 0;

    try {
        const projects = JSON.parse(storedProjects);
        if (Array.isArray(projects)) return projects.length;
    } catch {
        // 구분자로 저장된 이전 형식은 아래에서 개수를 셉니다.
    }

    return storedProjects.split("$$").filter(Boolean).length;
}

// 마지막 워크스페이스 방문일을 읽기 쉬운 날짜로 표시합니다.
function formatVisitDate(value) {
    if (!value) return "-";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return "-";
    return `${Number(match[2])}월 ${Number(match[3])}일`;
}

// 대시보드의 함께한 날, 프로젝트 수, 마지막 작업 통계를 갱신합니다.
function renderProfileStats(profile, today) {
    const daysStat = document.querySelector('[data-stat="days"]');
    const projectsStat = document.querySelector('[data-stat="projects"]');
    const lastEditedStat = document.querySelector('[data-stat="last-edited"]');

    if (daysStat) daysStat.textContent = String(getDaysTogether(profile.firstVisitDate, today));
    if (projectsStat) projectsStat.textContent = String(getProjectCount());
    if (lastEditedStat) lastEditedStat.textContent = formatVisitDate(profile.lastWorkspaceVisit);
}

let profile = loadProfile();
const today = getLocalDate();

// 최초 방문일을 한 번 기록하고 workspace.html 접속일을 마지막 작업일로 갱신합니다.
if (!profile.firstVisitDate) profile.firstVisitDate = today;
if (window.location.pathname.endsWith("/workspace.html")) {
    profile.lastWorkspaceVisit = today;
}
saveProfile(profile);

if (imageInput && avatar && nameInput && removeAvatarButton) {
    avatar.src = profile.avatar || EMPTY_AVATAR;
    removeAvatarButton.hidden = !profile.avatar;
    nameInput.value = typeof profile.name === "string" ? profile.name : "";
    renderProfileStats(profile, today);

    // 현재 이름을 기존 프로필 정보와 함께 저장합니다.
    const saveName = () => {
        profile.name = nameInput.value.trim();
        nameInput.value = profile.name;
        saveProfile(profile);
    };

    // 이름 입력이 확정되면 변경 내용을 저장합니다.
    nameInput.addEventListener("change", saveName);
    // Enter 키 입력 시 이름을 확정하고 저장하도록 포커스를 해제합니다.
    nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            nameInput.blur();
        }
    });

    // 커스텀 프로필 사진을 기본 아바타로 되돌리고 변경 내용을 저장합니다.
    removeAvatarButton.addEventListener("click", () => {
        profile.avatar = "";
        avatar.src = EMPTY_AVATAR;
        imageInput.value = "";
        removeAvatarButton.hidden = true;
        saveProfile(profile);
    });

    // 선택한 이미지 파일을 읽어 프로필 미리보기와 저장 데이터를 갱신합니다.
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        // 파일 읽기가 끝나면 데이터 URL을 프로필 이미지로 저장합니다.
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") return;
            avatar.src = reader.result;
            profile.avatar = reader.result;
            profile.name = nameInput.value.trim();
            removeAvatarButton.hidden = false;
            imageInput.value = "";
            saveProfile(profile);
        });
        reader.readAsDataURL(file);
    });
}


