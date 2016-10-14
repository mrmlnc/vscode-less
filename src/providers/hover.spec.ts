'use strict';

import * as assert from 'assert';

import { NodeType } from '../types/nodes';
import { ISymbols } from '../types/symbols';

import { doHover } from './hover';

interface IHover {
	language: string;
	value: string;
}

interface IValueNode {
	getText: () => string;
}

interface IVariableNode {
	offset: number;
	getName: () => string;
	getValue: () => IValueNode;
	getDefaultValue: () => IValueNode;
}

export function mockupVariableNode(name: string, value: string, offset: number): IVariableNode {
	return {
		offset,
		getName: () => name,
		getValue: () => ({
			getText: () => value
		}),
		getDefaultValue: () => ({
			getText: () => value
		})
	};
}

interface IChildrenNode {
	getChildren: () => IVariableNode[];
}

interface IMixinNode {
	offset: number;
	getName: () => string;
	getParameters: () => IChildrenNode;
	getParent: () => {
		type: NodeType;
	};
}

export function mockupMixinNode(name: string, parameters: IVariableNode[], offset: number): IMixinNode {
	return {
		offset,
		getName: () => name,
		getParameters: () => ({
			getChildren: () => parameters
		}),
		getParent: () => ({
			type: NodeType.Stylesheet
		})
	};
}

describe('Hover', () => {

	it('doHover', () => {
		const symbolsList: ISymbols[] = [{
			document: 'test.less',
			variables: [{
				name: '@test',
				value: null,
				offset: 0,
				mixin: null
			}],
			mixins: [{
				name: '.test',
				parameters: [],
				parent: ''
			}],
			imports: []
		}];

		const variableNode = <any>mockupVariableNode('@test', null, 0);
		variableNode.type = NodeType.VariableName;

		const variable = doHover('test.less', symbolsList, variableNode);

		assert.equal((<IHover>variable.contents).language, 'less');
		assert.equal((<IHover>variable.contents).value, '@test: null');

		const mixinNode = <any>mockupMixinNode('.test', [variableNode], 0);
		mixinNode.type = NodeType.MixinDeclaration;

		const identifierNode = <any>{
			type: NodeType.Identifier,
			getParent: () => mixinNode
		};

		const mixin = doHover('test.less', symbolsList, identifierNode);

		assert.equal((<IHover>mixin.contents).language, 'less');
		assert.equal((<IHover>mixin.contents).value, '.test() {…}');
	});

});
