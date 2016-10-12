'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable } from '../types/common';

/**
 * Returns the child Node of the specified type.
 *
 * @param {INode} parent
 * @param {NodeType} type
 * @returns {INode[]}
 */
function getChildByType(parent: INode, type: NodeType): INode[] {
	let childs = parent.getChildren().filter((node) => node.type === type);

	return childs.length ? childs : null;
}

/**
 * Returns information about Variable Declaration.
 *
 * @param {INode} node
 * @returns {IVariable}
 */
export function makeVariable(node: INode): IVariable {
	return {
		name: node.getName(),
		value: node.getValue().getText(),
		offset: node.offset
	};
}

/**
 * Returns information about set of Variable Declarations.
 *
 * @param {INode} node
 * @returns {IVariable}
 */
export function makeSetVariable(node: INode): IVariable[] {
	const children: INode[] = getChildByType(node, NodeType.Declarations);
	if (!children) {
		return [];
	}

	const variableNodes = getChildByType(children[0], NodeType.VariableDeclaration);
	if (!variableNodes) {
		return [];
	}

	return variableNodes.map(makeVariable);
}
