'use strict';

import { NodeType } from '../types/nodes';

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
