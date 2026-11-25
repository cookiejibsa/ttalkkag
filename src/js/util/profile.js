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

    const saveProfile = () => {
        const name = nameInput.value.trim();
        nameInput.value = name;
        profile = { name, avatar: profile?.avatar ?? "" };
        Save(ItemType.Profile, [JSON.stringify(profile)]);
    };

    nameInput.addEventListener("change", saveProfile);
    nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            nameInput.blur();
        }
    });

    imageInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") return;
            avatar.src = reader.result;
            profile = { name: nameInput.value.trim(), avatar: reader.result };
            Save(ItemType.Profile, [JSON.stringify(profile)]);
        });
        reader.readAsDataURL(file);
    });
}
