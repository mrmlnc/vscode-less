'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { getCacheStorage } from '../../services/cache';
import { doHover } from '../../providers/hover';
import { ISettings } from '../../types/settings';

const cache = getCacheStorage();

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	suggestMixins: true,
	suggestVariables: true
};

interface IHover {
	language: string;
	value: string;
}

function makeDocument(lines: string | string[]) {
	return TextDocument.create('test.less', 'less', 1, Array.isArray(lines) ? lines.join('\n') : lines);
}

describe('Providers/Hover', () => {

	it('doHover - Variables', () => {
		const doc = makeDocument([
			'@one: 1;',
			'.a { content: @one; }'
		]);

		// @o|
		assert.equal(<any>doHover(doc, 2, cache, settings), null);
		// .a { content: @o|
		assert.equal((<IHover>doHover(doc, 25, cache, settings).contents).value, '@one: 1;');
	});

	it('doHover - Mixins', () => {
		const doc = makeDocument([
			'.one(@a) { content: "nope"; }',
			'.one(1);'
		]);

		// .on|
		assert.equal(<any>doHover(doc, 3, cache, settings), null);
		// // .one(@|
		assert.equal(<any>doHover(doc, 6, cache, settings), null);
		// // .one(@a) { con|
		assert.equal(<any>doHover(doc, 14, cache, settings), null);
		// // .one(@a) { content: "no|
		assert.equal(<any>doHover(doc, 23, cache, settings), null);
		// .o|
		assert.equal((<IHover>doHover(doc, 32, cache, settings).contents).value, '.one(@a: null) {…}');
	});

});
