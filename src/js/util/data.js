// @ts-check
// data.js — Json 데이터 불러오기

/**
 * @typedef {Object} Tag
 * @property {string} tagId
 * @property {boolean} needCloseTag
 * @property {string[]} attributes
 */

/**
 * @type {Tag[]}
 */
let tagsData = [];

async function loadData() {
    const res = await fetch('../../data/Tags.json');
    if(!res.ok) return false;
    const /** @type {Tag[]} */ data = await res.json();
    tagsData = [];
    tagsData = data;
    return true;
}

function getData() {
    return tagsData;
}

// =========================================================================================================

/**
 * Json Data를 모두 로드합니다.
 * @returns {Promise<boolean>} 성공 여부
 */
export const Load = () => loadData();

/**
 * 로드 된 데이터를 가져옵니다.
 * @returns {Tag[]} 로드된 데이터
 */
export const Get = () => getData();