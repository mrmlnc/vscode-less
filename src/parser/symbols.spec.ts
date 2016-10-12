'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { findSymbols, findSymbolsAtOffset } from './symbols';

describe('Symbols', () => {

	let ls = getLESSLanguageService();

	ls.configure({
		lint: false,
		validate: false
	});

	it('findSymbols', () => {
		const doc = TextDocument.create('file.less', 'less', 1, '@name: "value";\n.mixin(@a: 1, @b) {};');
		const ast = <INode>ls.parseStylesheet(doc);
		const symbols = findSymbols(ast);

		// Variables
		assert.equal(symbols.variables.length, 1);

		assert.equal(symbols.variables[0].name, '@name');
		assert.equal(symbols.variables[0].value, '"value"');
		assert.equal(symbols.variables[0].offset, 0);

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].arguments.length, 2);
		assert.equal(symbols.mixins[0].offset, 16);

		assert.equal(symbols.mixins[0].arguments[0].name, '@a');
		assert.equal(symbols.mixins[0].arguments[0].value, '1');
		assert.equal(symbols.mixins[0].arguments[0].isMixinArgument, true);

		assert.equal(symbols.mixins[0].arguments[1].name, '@b');
		assert.equal(symbols.mixins[0].arguments[1].value, null);
		assert.equal(symbols.mixins[0].arguments[1].isMixinArgument, true);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

	it('findSymbolsAtOffset', () => {
		const doc = TextDocument.create('file.less', 'less', 1, '@name: "value";\n.mixin(@a: 1, @b) {};');
		const ast = <INode>ls.parseStylesheet(doc);
		const symbols = findSymbolsAtOffset(ast, 36);

		// Variables
		assert.equal(symbols.variables.length, 2);

		assert.equal(symbols.variables[0].name, '@a');
		assert.equal(symbols.variables[0].value, '1');
		assert.equal(symbols.variables[0].offset, 23);

		assert.equal(symbols.variables[1].name, '@b');
		assert.equal(symbols.variables[1].value, null);
		assert.equal(symbols.variables[1].offset, 30);

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].arguments.length, 2);
		assert.equal(symbols.mixins[0].offset, 16);

		assert.equal(symbols.mixins[0].arguments[0].name, '@a');
		assert.equal(symbols.mixins[0].arguments[0].value, '1');
		assert.equal(symbols.mixins[0].arguments[0].isMixinArgument, true);

		assert.equal(symbols.mixins[0].arguments[1].name, '@b');
		assert.equal(symbols.mixins[0].arguments[1].value, null);
		assert.equal(symbols.mixins[0].arguments[1].isMixinArgument, true);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

});
