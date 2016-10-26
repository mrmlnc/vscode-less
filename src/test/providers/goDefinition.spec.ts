'use strict';

import * as assert from 'assert';

import { TextDocument, Files } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { goDefinition } from '../../providers/goDefinition';

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	suggestMixins: true,
	suggestVariables: true
};

function makeDocument(lines: string | string[]) {
	return TextDocument.create('test.less', 'less', 1, Array.isArray(lines) ? lines.join('\n') : lines);
}

const cache = getCacheStorage();

cache.set('one.less', {
	document: 'one.less',
	variables: [
		{ name: '@a', value: '1', offset: 0, position: { line: 1, character: 1 } }
	],
	mixins: [
		{ name: '.mixin', parameters: [], offset: 0, position: { line: 1, character: 1 } }
	],
	imports: []
});

describe('Providers/GoDefinition', () => {

	it('doGoDefinition - Variables', () => {
		const doc = makeDocument('.a { content: @a; }');
		const result = goDefinition(doc, 15, cache, settings);

		assert.equal(result.length, 1);
		assert.ok(Files.uriToFilePath(result[0].uri), 'one.less');
		assert.deepEqual(result[0].range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 3 }
		});
	});

	it('doGoDefinition - Variable definition', () => {
		const doc = makeDocument('@a: 1;');
		const result = goDefinition(doc, 2, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Mixins', () => {
		const doc = makeDocument('.a { .mixin(); }');
		const result = goDefinition(doc, 8, cache, settings);

		assert.equal(result.length, 1);
		assert.ok(Files.uriToFilePath(result[0].uri), 'one.less');
		assert.deepEqual(result[0].range, {
			start: { line: 1, character: 1 },
			end: { line: 1, character: 7 }
		});
	});

	it('doGoDefinition - Mixin definition', () => {
		const doc = makeDocument('.a(@a) {}');
		const result = goDefinition(doc, 2, cache, settings);

		assert.equal(result.length, 0);
	});

	it('doGoDefinition - Mixin Arguments', () => {
		const doc = makeDocument('.a(@a) {}');
		const result = goDefinition(doc, 4, cache, settings);

		assert.equal(result.length, 0);
	});

});
