'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doSignatureHelp } from '../../providers/signatureHelp';

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
	variables: [],
	mixins: [
		{ name: '.one', parameters: [], offset: 0, position: null },
		{ name: '.two', parameters: [], offset: 0, position: null },
		{
			name: '.two',
			parameters: [
				{ name: '@a', value: null, offset: 0 }
			],
			offset: 0,
			position: null
		},
		{
			name: '.two',
			parameters: [
				{ name: '@a', value: null, offset: 0 },
				{ name: '@b', value: null, offset: 0 }
			],
			offset: 0,
			position: null
		}
	],
	imports: []
});

describe('Providers/SignatureHelp', () => {

	it('doSignatureHelp - Empty', () => {
		const doc = makeDocument('.one(');
		assert.equal(doSignatureHelp(doc, 5, cache, settings).signatures.length, 1);
	});

	it('doSignatureHelp - Closed without parameters', () => {
		const doc = makeDocument('.two()');
		assert.equal(doSignatureHelp(doc, 5, cache, settings).signatures.length, 3);
	});

	it('doSignatureHelp - Closed with parameters', () => {
		const doc = makeDocument('.two(1);');
		assert.equal(doSignatureHelp(doc, 8, cache, settings).signatures.length, 0);
	});

	it('doSignatureHelp - 1/2', () => {
		const doc = makeDocument('.two(1,');
		const signature = doSignatureHelp(doc, 7, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('doSignatureHelp - 2/2', () => {
		const doc = makeDocument('.two(1, 2,');
		const signature = doSignatureHelp(doc, 10, cache, settings);

		assert.equal(signature.activeParameter, 2, 'activeParameter');
		assert.equal(signature.signatures.length, 1, 'signatures.length');
	});

	it('doSignatureHelp - 3/2', () => {
		const doc = makeDocument('.two(1, 2, 3,');
		const signature = doSignatureHelp(doc, 13, cache, settings);

		assert.equal(signature.signatures.length, 0);
	});

	it('doSignatureHelp - 2/2 with parenthesis', () => {
		const doc = makeDocument('.two(1, 2)');
		const signature = doSignatureHelp(doc, 10, cache, settings);

		assert.equal(signature.signatures.length, 0);
	});

	it('doSignatureHelp - Two parameters with semicolon separation', () => {
		const doc = makeDocument('.two(1;');
		const signature = doSignatureHelp(doc, 7, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('doSignatureHelp - RGBA', () => {
		const doc = makeDocument('.two(rgba(0,0,0,.0001),');
		const signature = doSignatureHelp(doc, 23, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('doSignatureHelp - RGBA when typings', () => {
		const doc = makeDocument('.two(rgba(0,0,0,');
		const signature = doSignatureHelp(doc, 16, cache, settings);

		assert.equal(signature.activeParameter, 0, 'activeParameter');
		assert.equal(signature.signatures.length, 3, 'signatures.length');
	});

	it('doSignatureHelp - Quotes', () => {
		const doc = makeDocument('.two("\\",;",');
		const signature = doSignatureHelp(doc, 12, cache, settings);

		assert.equal(signature.activeParameter, 1, 'activeParameter');
		assert.equal(signature.signatures.length, 2, 'signatures.length');
	});

	it('doSignatureHelp - Single-line selector', () => {
		const doc = makeDocument('h1 { .two(1, }');
		assert.equal(doSignatureHelp(doc, 12, cache, settings).signatures.length, 2);
	});

	it('doSignatureHelp - Mixin with named argument', () => {
		const doc = makeDocument('.two(@a: 1,');
		assert.equal(doSignatureHelp(doc, 11, cache, settings).signatures.length, 2);
	});

});
