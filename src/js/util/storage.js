// @ts-check
// storage.js — localStorage 저장/불러오기/이름 중복 검사

/**
 * @param {string} itemId
 * @returns {string | null}
 */
function load(itemId) {
    if (itemId !== ItemType.Projects && itemId !== ItemType.Profile) return null;
    return localStorage.getItem(itemId);
} 

/**
 * @param {string} itemId
 * @param {string[]} item
 */
function save(itemId, item) {
    if (itemId !== ItemType.Projects && itemId !== ItemType.Profile) return null;
    localStorage.setItem(itemId, item.join('$$'));
}

/**
 * @param {string} itemId 
 * @param {string} item 
 * @returns {boolean}
 */
function isExists(itemId, item) {
    if (itemId !== ItemType.Projects && itemId !== ItemType.Profile) return false;
    const storageItem = localStorage.getItem(itemId)?.split('$$');
    if(!storageItem) return false;
    return storageItem.includes(item);
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

/**
 * 갤러리와 워크스페이스가 함께 사용하는 프로젝트 배열을 읽습니다.
 * @returns {Array<{ name: string, updatedAt: string, html: string, draft?: object }>}
 */
export function LoadProjects() {
    const stored = load(ItemType.Projects);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter(isProjectRecord);
    } catch {
        // 구분자로 저장된 예전 레코드를 아래에서 복구합니다.
    }

    return stored.split('$$').flatMap((entry) => {
        try {
            const parsed = JSON.parse(entry);
            return isProjectRecord(parsed) ? [parsed] : [];
        } catch {
            return [];
        }
    });
}

/** @param {Array<{ name: string, updatedAt: string, html: string, draft?: object }>} projects */
export function SaveProjects(projects) {
    save(ItemType.Projects, [JSON.stringify(projects)]);
}

/** @param {unknown} value */
function isProjectRecord(value) {
    if (!value || typeof value !== 'object') return false;
    const record = /** @type {Record<string, unknown>} */ (value);
    return typeof record.name === 'string'
        && typeof record.updatedAt === 'string'
        && typeof record.html === 'string';
}
