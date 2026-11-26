// data.js — 초기 HTML 태그 데이터 불러오기

/** @typedef {{ name: string, value: string }} TagAttribute */
/** @typedef {{ tagId: string, category: string, needCloseTag: boolean, attributes: TagAttribute[] }} Tag */

const fetchURL = "../../assets/data/Tags.json";
/** @type {Tag[]} */
let tagsData = [];

/** @returns {Promise<boolean>} JSON 로드 성공 여부 */
export async function LoadAsync() {
  try {
    const response = await fetch(fetchURL);
    if (!response.ok) {
      tagsData = [];
      return false;
    }

    const data = /** @type {Tag[]} */ (await response.json());
    tagsData = Array.isArray(data) ? data : [];
    return tagsData.length > 0;
  } catch (error) {
    console.error("태그 데이터를 불러오지 못했습니다.", error);
    tagsData = [];
    return false;
  }
}

/** @returns {Tag[]} 로드된 태그 목록 */
export const Get = () => tagsData;
