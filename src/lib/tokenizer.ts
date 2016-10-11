'use strict';

const NEWLINE = '\n'.charCodeAt(0);
const SLASH = '/'.charCodeAt(0);
const ASTERISK = '*'.charCodeAt(0);
const OPENED_CURLY_BASKET = '{'.charCodeAt(0);
const CLOSED_CURLY_BASKET = '}'.charCodeAt(0);
// const AT = '@'.charCodeAt(0);

interface IToken {
	line: number;
}

export default function tokenizer(input: string): IToken[] {
	const tokens: IToken[] = [];

	let pos = 0;
	let line = 1;
	// let next = 0;

	while (pos < input.length) {
		let code = input.charCodeAt(pos);

		switch (code) {
			case NEWLINE:
				pos++;
				line++;
				break;

			case SLASH:
				code = input.charCodeAt(pos + 1);
				if (code === SLASH) {
					pos = input.indexOf('\n', pos + 1) + 1;
				} else if (code === ASTERISK) {
					pos = input.indexOf('*/', pos + 2) + 1;
				} else {
					pos++;
				}
				break;

			case OPENED_CURLY_BASKET:
				pos++;
				break;

			case CLOSED_CURLY_BASKET:
				pos++;
				break;

			default:
				pos++;
				break;
		}
	}

	return tokens;
}
