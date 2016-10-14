'use strict';

/**
 * Returns word by specified position.
 *
 * @param {string} text
 * @param {number} offset
 * @returns
 */
export function getCurrentWord(text: string, offset: number) {
	let i = offset - 1;
	while (i >= 0 && ' \t\n\r":[()]},'.indexOf(text.charAt(i)) === -1) {
		i--;
	}
	return text.substring(i + 1, offset);
}

/**
 * Returns text after specified position.
 *
 * @export
 * @param {string} text
 * @param {number} offset
 * @returns
 */
export function getTextAfterCurrentWord(text: string, offset: number) {
	let i = offset + 1;
	while ('\n\r'.indexOf(text.charAt(i)) === -1) {
		i++;
	}
	return text.substring(i + 1, offset);
}
