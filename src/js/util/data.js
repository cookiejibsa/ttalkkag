// @ts-check
// data.js — Json 데이터 불러오기

const fetchURL = '../../assets/data/Tags.json'

/**
 * @typedef {Object} Tag
 * @property {string} tagId
 * @property {boolean} needCloseTag
 * @property {Attribute[]} attributes
 */

/**
 * @typedef {Object} Attribute
 * @property {string} id
 * @property {*} value
 */

/**
 * @type {Tag[]}
 */
let tagsData = [];

/**
 * @type {boolean}
 */
let loaded = false;

async function loadDataAsync() {
    loaded = false;
    const res = await fetch(fetchURL);
    loaded = true;
    if(!res.ok) return false;
    const /** @type {Tag[]} */ data = await res.json();
    tagsData = [];
    tagsData = data;
    return true;
}

function getData() {
    return tagsData;
}

async function waitLoad() {
    let waitInit = setInterval(() => {
        if(IsLoaded()) clearInterval(waitInit); 
    }, 1000);
}

// =========================================================================================================

/**
 * Json Data를 모두 로드합니다.
 * @returns {Promise<boolean>} 성공 여부
 */
export const LoadAsync = async () => loadDataAsync();

/**
 * 로드 된 데이터를 가져옵니다.
 * @returns {Tag[]} 로드된 데이터
 */
export const Get = () => getData();

/**
 * 데이터가 로드되었는지 확인하는 함수
 * @returns 로드 여부
 */
export const IsLoaded = () => loaded;

export const WaitToLoad = async () => waitLoad;