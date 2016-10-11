'use strict';

import { INode, NodeType, IVariable } from './types';
import { getChildByType } from './helpers';

/**
 * Returns information about Variable Declaration.
 *
 * @param {INode} node
 * @returns {IVariable}
 */
export function getVariableDeclaration(node: INode): IVariable {
	const name = node.getName().slice(1);
	const value = node.getValue().getText();
	const offset = node.offset;

	return {
		name,
		value,
		offset
	};
}

/**
 * Returns information about Variable Declarations.
 *
 * @param {INode} node
 * @returns {IVariable[]}
 */
export function getVariableDeclarations(node: INode): IVariable[] {
	const rulesetNode = getChildByType(node, NodeType.Declarations);
	const variableNodes = getChildByType(rulesetNode[0], NodeType.VariableDeclaration);

	if (!variableNodes) {
		return [];
	}

	return variableNodes.map(getVariableDeclaration);
}
