// data.js — 초기 HTML 태그 데이터 불러오기

/** @typedef {{ name: string, value: string }} TagAttribute */
/** @typedef {{ tagId: string, category: string, needCloseTag: boolean, attributes: TagAttribute[] }} Tag */

const fetchURL = "../../assets/data/Tags.json";
/** @type {Tag[]} */
let tagsData = [];
/** @type {Promise<boolean> | null} 진행 중이거나 끝난 로드. 여러 곳에서 불러도 한 번만 받아온다 */
let loadPromise = null;

/** @returns {Promise<boolean>} JSON 로드 성공 여부 */
export function LoadAsync() {
  if (!loadPromise) loadPromise = fetchTags();
  return loadPromise;
}

/** @returns {Promise<boolean>} JSON 로드 성공 여부 */
async function fetchTags() {
  try {
    const response = await fetch(fetchURL);
    if (!response.ok) {
      tagsData = [];
      loadPromise = null;
      return false;
    }

    const data = /** @type {Tag[]} */ (await response.json());
    tagsData = Array.isArray(data) ? data : [];
    return tagsData.length > 0;
  } catch (error) {
    console.error("태그 데이터를 불러오지 못했습니다.", error);
    tagsData = [];
    loadPromise = null;
    return false;
  }
}

/** @returns {Tag[]} 로드된 태그 목록 */
export const Get = () => tagsData;

/** 태그 데이터 로드가 끝날 때까지 기다린다. 아직 아무도 불러오지 않았다면 여기서 불러온다 */
export const WaitToLoad = () => LoadAsync();
