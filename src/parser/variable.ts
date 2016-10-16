'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable } from '../types/symbols';

import { getChildByType } from '../utils/ast';

/**
 * Returns information about Variable Declaration.
 *
 * @param {INode} node
 * @returns {IVariable}
 */
export function makeVariable(node: INode, fromMixin: string = null): IVariable {
	const valueNode: INode = fromMixin ? node.getDefaultValue() : node.getValue();

	let value: string = null;
	if (valueNode) {
		value = valueNode.getText().replace(/\n/g, ' ').replace(/\s\s+/g, ' ');
	}

	return {
		name: node.getName(),
		value,
		offset: node.offset,
		mixin: fromMixin
	};
}

/**
 * Returns information about set of Variable Declarations.
 *
 * @param {INode} node
 * @returns {IVariable}
 */
export function makeSetVariable(node: INode): IVariable[] {
	const variableNodes = getChildByType(node, NodeType.VariableDeclaration);
	if (!variableNodes) {
		return [];
	}

	const variables: IVariable[] = [];
	for (let i = 0; i < variableNodes.length; i++) {
		if (variableNodes[i].getValue()) {
			variables.push(makeVariable(variableNodes[i]));
		}
	}

	return variables;
}
