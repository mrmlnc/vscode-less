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

	it('findSymbols - Variables', () => {
		const ast = parseText([
			'@a: 1;',
			'.a {',
			'  @b: 2;',
			'}'
		]);

		const { variables } = findSymbols(ast);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '@a');
		assert.equal(variables[0].value, '1');
	});

	it('findSymbols - Mixins', () => {
		const ast = parseText([
			'.a() {}',
			'.a {',
			'  .b() {}',
			'}',
			'.c() {',
			'  .d() {}',
			'}'
		]);

		const { mixins } = findSymbols(ast);

		assert.equal(mixins.length, 3);

		assert.equal(mixins[0].name, '.a');
		assert.equal(mixins[1].name, '.b');
		assert.equal(mixins[2].name, '.c');
	});

	it('findSymbols - Imports', () => {
		const ast = parseText([
			'@import "styles.less";',
			'@import "styles.css";',
			'@import "@{styles}.less";',
			'@import "styles/**/*.less";'
		]);

		const { imports } = findSymbols(ast);

		assert.equal(imports.length, 1);

		assert.equal(imports[0], 'styles.less');
	});

	it('findSymbolsAtOffset - Variables', () => {
		const ast = parseText([
			'@a: 1;',
			'.a {',
			'  @b: 2;',
			'}'
		]);

		const { variables } = findSymbolsAtOffset(ast, 22);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '@b');
		assert.equal(variables[0].value, '2');
	});

	it('findSymbolsAtOffset - Mixins', () => {
		const ast = parseText([
			'.a() {}',
			'.a {',
			'  .b() {}',
			'}',
			'.c() {',
			'  .d() {}',
			'}'
		]);

		// .a() {__0__}
		// .a {__1__
		//   .b() {__2__}
		// }__3__
		// .c() {__4__
		//   .d() {__5__}
		// }__6__

		assert.equal(findSymbolsAtOffset(ast, 6).mixins.length, 1, '__0__');
		assert.equal(findSymbolsAtOffset(ast, 12).mixins.length, 0, '__1__');
		assert.equal(findSymbolsAtOffset(ast, 21).mixins.length, 1, '__2__');
		assert.equal(findSymbolsAtOffset(ast, 24).mixins.length, 0, '__3__');
		assert.equal(findSymbolsAtOffset(ast, 31).mixins.length, 1, '__4__');
		assert.equal(findSymbolsAtOffset(ast, 40).mixins.length, 2, '__5__');
		assert.equal(findSymbolsAtOffset(ast, 43).mixins.length, 1, '__6__');
	});

});
