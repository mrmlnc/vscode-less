'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../../types/nodes';
import { findSymbols, findSymbolsAtOffset } from '../../parser/symbols';

const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.less', 'less', 1, text.join('\n'));
	return <INode>ls.parseStylesheet(doc);
}

describe('Parser/Symbols', () => {

	it('findSymbols - Variables', () => {
		const text = [
			'@a: 1;',
			'.a {',
			'  @b: 2;',
			'}'
		].join('\n');

		const { variables } = findSymbols(text);

		assert.equal(variables.length, 1);

		assert.equal(variables[0].name, '@a');
		assert.equal(variables[0].value, '1');
	});

	it('findSymbols - Mixins', () => {
		const text = [
			'.a() {}',
			'.a {',
			'  .b() {}',
			'}',
			'.c() {',
			'  .d() {}',
			'}'
		].join('\n');

		const { mixins } = findSymbols(text);

		assert.equal(mixins.length, 2);

		assert.equal(mixins[0].name, '.a');
		assert.equal(mixins[1].name, '.c');
	});

	it('findSymbols - Imports', () => {
		const text = [
			'@import "styles.less";',
			'@import "styles.css";',
			'@import "@{styles}.less";',
			'@import "styles/**/*.less";'
		].join('\n');

		const { imports } = findSymbols(text);

		assert.equal(imports.length, 4);

		assert.equal(imports[0].filepath, 'styles.less');
		assert.equal(imports[1].filepath, 'styles.css');
		assert.equal(imports[2].filepath, '@{styles}.less');
		assert.equal(imports[3].filepath, 'styles/**/*.less');
	});

	it('findSymbolsAtOffset - Variables', () => {
		const ast = parseText([
			'@a: 1;',
			'.a {',
			'  @b: 2;',
			'}'
		]);

		const { variables } = findSymbolsAtOffset(ast, 21);

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

		assert.equal(findSymbolsAtOffset(ast, 6).mixins.length, 0, '__0__');
		assert.equal(findSymbolsAtOffset(ast, 12).mixins.length, 1, '__1__');
		assert.equal(findSymbolsAtOffset(ast, 21).mixins.length, 1, '__2__');
		assert.equal(findSymbolsAtOffset(ast, 24).mixins.length, 1, '__3__');
		assert.equal(findSymbolsAtOffset(ast, 31).mixins.length, 1, '__4__');
		assert.equal(findSymbolsAtOffset(ast, 40).mixins.length, 1, '__5__');
		assert.equal(findSymbolsAtOffset(ast, 43).mixins.length, 1, '__6__');
	});

});
