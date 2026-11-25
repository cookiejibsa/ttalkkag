// profile.js — 프로필 정보 표시 및 localStorage 저장
import { Load, Save, ItemType } from "./storage.js";

const imageInput = document.getElementById("imageInput");
const avatar = document.querySelector(".profile-avatar");
const nameInput = document.getElementById("profile-name");
const EMPTY_AVATAR = "/assets/icons/avatar_empty.jpg";

if (imageInput && avatar && nameInput) {
    avatar.src = EMPTY_AVATAR;
    /** @type {{ name: string, avatar: string } | null} */
    let profile = null;

    try {
        const savedProfile = Load(ItemType.Profile);
        if (savedProfile) {
            // Save stores an array joined by $$, so the first item is this profile JSON.
            const parsed = JSON.parse(savedProfile.split("$$")[0]);
            if (parsed && typeof parsed === "object") {
                profile = {
                    name: typeof parsed.name === "string" ? parsed.name : "",
                    avatar: typeof parsed.avatar === "string" ? parsed.avatar : ""
                };
            }
        }
    } catch (error) {
        console.warn("저장된 프로필을 불러오지 못했습니다.", error);
    }

    if (profile) {
        nameInput.value = profile.name;
        if (profile.avatar) avatar.src = profile.avatar;
    }

    // 현재 프로필 이름과 이미지를 로컬 스토리지에 저장합니다.
    const saveProfile = () => {
        const name = nameInput.value.trim();
        nameInput.value = name;
        profile = { name, avatar: profile?.avatar ?? "" };
        Save(ItemType.Profile, [JSON.stringify(profile)]);
    };

    // 이름 입력이 확정되면 프로필을 저장합니다.
    nameInput.addEventListener("change", saveProfile);
    // Enter 키로 이름 입력을 확정하고 저장되도록 포커스를 해제합니다.
    nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            nameInput.blur();
        }
    });

    // 선택한 이미지 파일을 읽어 미리보기와 로컬 스토리지를 갱신합니다.
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        // 파일 읽기가 끝나면 데이터 URL을 프로필 이미지로 적용합니다.
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") return;
            avatar.src = reader.result;
            profile = { name: nameInput.value.trim(), avatar: reader.result };
            Save(ItemType.Profile, [JSON.stringify(profile)]);
        });
        reader.readAsDataURL(file);
    });
}
