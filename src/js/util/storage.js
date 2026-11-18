// @ts-check
// storage.js — localStorage 저장/불러오기/이름 중복 검사

/**
 * @param {string} itemId
 * @returns {string | null}
 */
function load(itemId) {
    if(!ItemType.Projects.includes(itemId)) return null;
    return localStorage.getItem(itemId);
} 

/**
 * @param {string} itemId
 * @param {string[]} item
 */
function save(itemId, item) {
    if(!ItemType.Projects.includes(itemId)) return null;
    localStorage.setItem(itemId, item.join('$$'));
}

/**
 * @param {string} itemId 
 * @param {string} item 
 * @returns {boolean}
 */
function isExists(itemId, item) {
    if(!ItemType.Projects.includes(itemId)) return false;
    const storageItem = localStorage.getItem(itemId)?.split('$$');
    if(!storageItem) return false;
    storageItem.forEach((i) => {
        if(i === item) return true;
    });
    return false;
}

// ===============================================================================

/**
 * 로컬 스토리지에서 사용되는 식별자
 */
export const ItemType = Object.freeze({
    Projects: "project",
    Profile: "profile"
});

/**
 * 로컬 스토리지에서 결과를 가져오는 함수
 * @param {string} itemId 불러올 아이템의 id, @see ItemType 을 사용할 것을 추천.
 * @returns {string | null} 로컬스토리지 결과
 */
export const Load = (itemId) => load(itemId)

/**
 * 로컬 스토리지에 데이터를 저장하는 함수
 * @param {string} itemId 저장할 아이템의 id, @see ItemType 을 사용할 것을 추천.
 * @param {string[]} item 저장할 item
 */
export const Save = (itemId, item) => save(itemId, item)

/**
 * 로컬 스토리지에 데이터가 있는지 찾는 함수
 * @param {string} itemId 찾을 아이템의 id, @see ItemType 을 사용할 것을 추천.
 * @param {string} item 저장할 item
 * @returns 데이터의 유무
 */
export const Exists = (itemId, item) => isExists(itemId, item)