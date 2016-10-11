'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import { TextDocument } from 'vscode-languageserver';

import parser from './parser';

let data;
let document;

describe('Parser - processing of the imported file', () => {
	beforeEach(() => {
		data = fs.readFileSync('./fixtures/parser.less');
		document = TextDocument.create('./fixtures/parser.less', 'less', 1, data.toString());
	});

	it('Variables', () => {
		const vars = parser(document).variables;

		assert.equal(vars.length, 2);

		assert.equal(vars[0].name, 'one');
		assert.equal(vars[0].value, '1');

		assert.equal(vars[1].name, 'two');
		assert.equal(vars[1].value, '{\n\tcontent: "test";\n}');
	});

	it('Mixins', () => {
		const mixins = parser(document).mixins;

		assert.equal(mixins.length, 2);

		assert.equal(mixins[0].name, '.mixin');

		assert.equal(mixins[0].arguments.length, 2);
		assert.equal(mixins[0].arguments[0].name, 'zeroWithDefaultValue');
		assert.equal(mixins[0].arguments[0].value, '0');
		assert.equal(mixins[0].arguments[1].name, 'zero');
		assert.equal(mixins[0].arguments[1].value, null);

		assert.equal(mixins[1].name, '.a > .b .c');

		assert.equal(mixins[1].arguments.length, 2);
		assert.equal(mixins[1].arguments[0].name, 'four');
		assert.equal(mixins[1].arguments[0].value, '4');
		assert.equal(mixins[1].arguments[1].name, 'five');
		assert.equal(mixins[1].arguments[1].value, '5');
	});
});

describe('Parser - processing of the opened file', () => {
	beforeEach(() => {
		data = fs.readFileSync('./fixtures/parser.less');
		document = TextDocument.create('./fixtures/parser.less', 'less', 1, data.toString());
	});

	it('Variables - position: 92', () => {
		const vars = parser(document, 92).variables;

		assert.equal(vars.length, 4);

		assert.equal(vars[0].name, 'zero');
		assert.equal(vars[1].name, 'zeroWithDefaultValue');
		assert.equal(vars[2].name, 'two');
		assert.equal(vars[3].name, 'one');
	});

	it('Mixins - position: 92', () => {
		const mixins = parser(document, 92).mixins;

		assert.equal(mixins.length, 2);

		assert.equal(mixins[0].name, '.mixin');
		assert.equal(mixins[1].name, '.a > .b .c');
	});

	it('Variables - position: 176', () => {
		const vars = parser(document, 176).variables;

		assert.equal(vars.length, 6);

		assert.equal(vars[0].name, 'test');
		assert.equal(vars[1].name, 'five');
		assert.equal(vars[2].name, 'four');
		assert.equal(vars[3].name, 'three');
		assert.equal(vars[4].name, 'two');
		assert.equal(vars[5].name, 'one');
	});

	it('Mixins - position: 176', () => {
		const mixins = parser(document, 176).mixins;

		assert.equal(mixins.length, 2);

		assert.equal(mixins[0].name, '.mixin');
		assert.equal(mixins[1].name, '.a > .b .c');
	});
});
