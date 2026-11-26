// @ts-check
// gallery.js — 저장된 프로젝트 목록 → 카드 렌더링, 카드 클릭 시 workspace.html로 이어서 열기

import { ItemType, Load } from "./storage.js";

/**
 * @type {string[]}
 */
let projects;

const init = () => {
    projects = Load(ItemType.Projects)?.split("$$") ?? [];
    console.log(projects);
};

const getCards = () => {
    /**
     * @type {HTMLElement[]}
     */
    const cards = [];

    projects.forEach((p) => {
        // [1] Create Elements
        const cardA = document.createElement('a');
        const thumbDiv = document.createElement('div');
        const metaDiv = document.createElement('div');
        const nameDiv = document.createElement('div');
        const dateDiv = document.createElement('div');

        // [2] Add Attributes to Elements
        cardA.className = "project-card";
        cardA.href = `workspace.html?name=`;

        thumbDiv.className = "card-thumb";

        metaDiv.className = "card-meta";

        nameDiv.className = "card-name";

        dateDiv.className = "card-date";

        // [3] Append Child Elements
        cardA.appendChild(thumbDiv);

        // [4] Append Cards
        cards.push(cardA);
    });

    // [5] Return Cards
    return cards;
}

export const Init = () => init;
