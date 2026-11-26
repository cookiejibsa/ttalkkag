// @ts-check
// codeGenerator.js — state → 코드 문자열 (내부용/표시용, 들여쓰기, 이스케이핑)

import { Get, WaitToLoad } from "./data.js";

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
let Tags = [];

async function init() {
    await WaitToLoad();
    Tags = Get();
}

function generate() {
    Tags.forEach((tag) => {
        console.log(tag);
    });
}

export const Init = async () => init()
export const Generate = () => generate()

await Init();
Generate();