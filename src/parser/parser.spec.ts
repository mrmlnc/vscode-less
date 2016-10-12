'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { parseDocument } from './parser';

describe('Parser', () => {

	it('Find symbols without offset position', () => {
		const doc = TextDocument.create('file.less', 'less', 1, '@name: "value";\n.mixin(@a: 1, @b) {};');
		const symbols = parseDocument(doc);

		// Variables
		assert.equal(symbols.variables.length, 1);

		assert.equal(symbols.variables[0].name, 'name');
		assert.equal(symbols.variables[0].value, '"value"');
		assert.equal(symbols.variables[0].offset, 0);

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].arguments.length, 2);
		assert.equal(symbols.mixins[0].offset, 16);

		assert.equal(symbols.mixins[0].arguments[0].name, 'a');
		assert.equal(symbols.mixins[0].arguments[0].value, '1');
		assert.equal(symbols.mixins[0].arguments[0].isMixinArgument, true);

		assert.equal(symbols.mixins[0].arguments[1].name, 'b');
		assert.equal(symbols.mixins[0].arguments[1].value, null);
		assert.equal(symbols.mixins[0].arguments[1].isMixinArgument, true);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

	it('Find symbols with offset position', () => {
		const doc = TextDocument.create('file.less', 'less', 1, '@name: "value";\n.mixin(@a: 1, @b) {};');
		const symbols = parseDocument(doc, 36);

		// Variables
		assert.equal(symbols.variables.length, 3);

		assert.equal(symbols.variables[0].name, 'b');
		assert.equal(symbols.variables[0].value, null);
		assert.equal(symbols.variables[0].offset, 30);

		assert.equal(symbols.variables[1].name, 'a');
		assert.equal(symbols.variables[1].value, '1');
		assert.equal(symbols.variables[1].offset, 23);

		assert.equal(symbols.variables[2].name, 'name');
		assert.equal(symbols.variables[2].value, '"value"');
		assert.equal(symbols.variables[2].offset, 0);

		// Mixins
		assert.equal(symbols.mixins.length, 1);

		assert.equal(symbols.mixins[0].name, '.mixin');
		assert.equal(symbols.mixins[0].arguments.length, 2);
		assert.equal(symbols.mixins[0].offset, 16);

		assert.equal(symbols.mixins[0].arguments[0].name, 'a');
		assert.equal(symbols.mixins[0].arguments[0].value, '1');
		assert.equal(symbols.mixins[0].arguments[0].isMixinArgument, true);

		assert.equal(symbols.mixins[0].arguments[1].name, 'b');
		assert.equal(symbols.mixins[0].arguments[1].value, null);
		assert.equal(symbols.mixins[0].arguments[1].isMixinArgument, true);

		// Imports
		assert.equal(symbols.imports.length, 0);
	});

});
