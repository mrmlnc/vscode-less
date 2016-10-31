'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doCompletion } from '../../providers/completion';

const settings = <ISettings>{
	scannerExclude: [],
	scannerDepth: 20,
	showErrors: false,
	implicitlyLabel: '(implicitly)',
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
		{ name: '@one', value: '1', offset: 0, position: null },
		{ name: '@two', value: null, offset: 0, position: null }
	],
	mixins: [
		{ name: '.test', parameters: [], offset: 0, position: null }
	],
	imports: []
});

describe('Providers/Completion - Basic', () => {

	it('Variables', () => {
		const doc = makeDocument('@');
		assert.equal(doCompletion(doc, 1, settings, cache).items.length, 2);
	});

	it('Mixins', () => {
		const doc = makeDocument('.');
		assert.equal(doCompletion(doc, 1, settings, cache).items.length, 1);
	});

});

describe('Providers/Completion - Context', () => {

	it('Empty property value', () => {
		const doc = makeDocument('.a { content:  }');
		assert.equal(doCompletion(doc, 14, settings, cache).items.length, 2);
	});

	it('Non-empty property value without suggestions', () => {
		const doc = makeDocument('.a { background: url(../images/one.png); }');
		assert.equal(doCompletion(doc, 34, settings, cache).items.length, 0);
	});

	it('Non-empty property value with Variables', () => {
		const doc = makeDocument('.a { background: url(../images/@{one}/one.png); }');
		assert.equal(doCompletion(doc, 36, settings, cache).items.length, 2, 'True');
		assert.equal(doCompletion(doc, 41, settings, cache).items.length, 0, 'False');
	});

	it('Discard suggestions inside quotes', () => {
		const doc = makeDocument('.a { background: url("../images/@{one}/@one.png"); .test("test", @one); }');
		assert.equal(doCompletion(doc, 43, settings, cache).items.length, 0, 'Hide');
		assert.equal(doCompletion(doc, 37, settings, cache).items.length, 2, 'True');
		assert.equal(doCompletion(doc, 69, settings, cache).items.length, 2, 'Mixin');
	});

	it('Discard suggestions inside single-line comments', () => {
		const doc = makeDocument('// @');
		assert.equal(doCompletion(doc, 4, settings, cache).items.length, 0);
	});

	it('Discard suggestions inside block comments', () => {
		const doc = makeDocument('/* @ */');
		assert.equal(doCompletion(doc, 4, settings, cache).items.length, 0);
	});

});

describe('Providers/Completion - Implicitly', () => {

	it('Show default implicitly label', () => {
		const doc = makeDocument('@');
		assert.equal(doCompletion(doc, 1, settings, cache).items[0].detail, '(implicitly) one.less');
	});

	it('Show custom implicitly label', () => {
		const doc = makeDocument('@');
		settings.implicitlyLabel = '👻';
		assert.equal(doCompletion(doc, 1, settings, cache).items[0].detail, '👻 one.less');
	});

	it('Hide implicitly label', () => {
		const doc = makeDocument('@');
		settings.implicitlyLabel = null;
		assert.equal(doCompletion(doc, 1, settings, cache).items[0].detail, 'one.less');
	});

});
