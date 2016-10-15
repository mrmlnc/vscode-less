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
 * Returns text before specified position.
 *
 * @export
 * @param {string} text
 * @param {number} offset
 * @returns
 */
export function getTextBeforePosition(text: string, offset: number) {
	let i = offset - 1;
	while ('\n\r'.indexOf(text.charAt(i)) === -1) {
		i--;
	}
	return text.substring(i + 1, offset + 1);
}

/**
 * Returns text after specified position.
 *
 * @export
 * @param {string} text
 * @param {number} offset
 * @returns
 */
export function getTextAfterPosition(text: string, offset: number) {
	let i = offset + 1;
	while ('\n\r'.indexOf(text.charAt(i)) === -1) {
		i++;
	}
	return text.substring(i + 1, offset);
}

/**
 * Limit of string length.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export function getLimitedString(str: string, ellipsis = true): string {
	if (!str) {
		return 'null';
	}

	// Twitter <3
	if (str.length < 140) {
		return str;
	}

	return str.slice(0, 140) + (ellipsis ? '\u2026' : '');
}
