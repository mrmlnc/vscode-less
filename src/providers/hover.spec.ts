'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { ISymbols } from '../types/symbols';

import { doHover } from './hover';

const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

function parseText(text: string[]): INode {
	const doc = TextDocument.create('test.less', 'less', 1, text.join('\n'));
	return <INode>ls.parseStylesheet(doc);
}

interface IHover {
	language: string;
	value: string;
}

describe('Hover', () => {

	it('doHover', () => {
		const symbolsList: ISymbols[] = [{
			document: 'test.less',
			variables: [{
				name: '@test',
				value: '1',
				offset: 0,
				mixin: null
			}],
			mixins: [{
				name: '.test',
				parameters: [],
				parent: null,
				offset: 0
			}],
			imports: []
		}];

		const ast = parseText([
			'@test: 1;',
			'.test() {}'
		]);

		// Stylesheet -> VariableDeclaration -> Variable
		const variableNode = ast.getChild(0).getChild(0);
		const variableHover: IHover = <any>doHover('test.less', symbolsList, variableNode).contents;

		assert.equal(variableHover.language, 'less');
		assert.equal(variableHover.value, '@test: 1');

		// Stylesheet -> MixinDeclaration -> Identifier
		const mixinNode = ast.getChild(1).getChild(0);
		const mixinHover: IHover = <any>doHover('test.less', symbolsList, mixinNode).contents;

		assert.equal(mixinHover.language, 'less');
		assert.equal(mixinHover.value, '.test() {…}');
	});

});
