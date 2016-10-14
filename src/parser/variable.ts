'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable } from '../types/symbols';

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
	const childs: INode[] = getChildByType(node, NodeType.Declarations);
	if (!childs) {
		return [];
	}

	const variableNodes = getChildByType(childs[0], NodeType.VariableDeclaration);
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
