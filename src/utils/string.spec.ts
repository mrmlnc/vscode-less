'use strict';

import * as assert from 'assert';

import { getCurrentWord, getTextAfterCurrentWord } from './string';

describe('String', () => {

	it('getCurrentWord', () => {
		const text = `.text(@a) {}`;

		assert.equal(getCurrentWord(text, 5), '.text');
		assert.equal(getCurrentWord(text, 8), '@a');
	});

	it('getTextAfterCurrentWord', () => {
		const text = `.text(@a) {}`;

		assert.equal(getTextAfterCurrentWord(text, 5), '(@a) {}');
		assert.equal(getTextAfterCurrentWord(text, 8), ') {}');
	});

});
