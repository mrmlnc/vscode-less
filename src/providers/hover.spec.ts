'use strict';

import * as assert from 'assert';

import { NodeType } from '../types/nodes';
import { ISymbols } from '../types/common';

import { mockupVariableNode, mockupMixinNode } from '../test/mockup';
import { doHover } from './hover';

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
				value: null,
				offset: 0
			}],
			mixins: [{
				name: '.test',
				arguments: [],
				offset: 0
			}],
			imports: []
		}];

		const variableNode = <any>mockupVariableNode('@test', null, 0);
		variableNode.type = NodeType.VariableName;

		const variable = doHover('test.less', symbolsList, variableNode);

		assert.equal((<IHover>variable.contents).language, 'less');
		assert.equal((<IHover>variable.contents).value, '@test: null [current]');

		const mixinNode = <any>mockupMixinNode('.test', [variableNode], 0);
		mixinNode.type = NodeType.MixinDeclaration;

		const identifierNode = <any>{
			type: NodeType.Identifier,
			getParent: () => mixinNode
		};

		const mixin = doHover('test.less', symbolsList, identifierNode);

		assert.equal((<IHover>mixin.contents).language, 'less');
		assert.equal((<IHover>mixin.contents).value, '.test() {…} [current]');
	});

});
