'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { findSymbols, findSymbolsAtOffset } from './symbols';

const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.less', 'less', 1, text.join('\n'));
	return <INode>ls.parseStylesheet(doc);
}

describe('Symbols', () => {

	it('findSymbols', () => {
		const ast = parseText([
			'@import "test.css";',
			'@import "@{variable}.less";',
			'@import "**/*.less";',
			'@name: "value";',
			'.mixin(@a: 1, @b) {};'
		]);

		const symbols = findSymbols(ast);

		// Variables
		assert.equal(symbols.variables.length, 1);

		assert.equal(symbols.variables[0].name, '@name');
		assert.equal(symbols.variables[0].value, '"value"');

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].parameters.length, 2);

		assert.equal(symbols.mixins[0].parameters[0].name, '@a');
		assert.equal(symbols.mixins[0].parameters[0].value, '1');

		assert.equal(symbols.mixins[0].parameters[1].name, '@b');
		assert.equal(symbols.mixins[0].parameters[1].value, null);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

	it('findSymbolsAtOffset', () => {
		const ast = parseText([
			'@name: "value";',
			'.a {',
			'  @a: 1;',
			'  .mixin(@b: 1, @c) {};',
			'}'
		]);

		const symbols = findSymbolsAtOffset(ast, 51);

		// Variables
		assert.equal(symbols.variables.length, 3);

		assert.equal(symbols.variables[0].name, '@b');
		assert.equal(symbols.variables[0].value, '1');

		assert.equal(symbols.variables[1].name, '@c');
		assert.equal(symbols.variables[1].value, null);

		assert.equal(symbols.variables[2].name, '@a');
		assert.equal(symbols.variables[2].value, '1');

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].parameters.length, 2);

		assert.equal(symbols.mixins[0].parameters[0].name, '@b');
		assert.equal(symbols.mixins[0].parameters[0].value, '1');

		assert.equal(symbols.mixins[0].parameters[1].name, '@c');
		assert.equal(symbols.mixins[0].parameters[1].value, null);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

});
