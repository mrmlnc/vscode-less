'use strict';

import { INode, NodeType } from './types';

export function sortByOffset(a: { offset: number }, b: { offset: number }): number {
	if (a.offset > b.offset) {
		return -1;
	} else if (a.offset < b.offset) {
		return 1;
	}

	return 0;
}

/**
 * Returns the child Node of the specified type.
 *
 * @param {INode} parent
 * @param {NodeType} type
 * @returns {INode[]}
 */
export function getChildByType(parent: INode, type: NodeType): INode[] {
	let childs = parent.getChildren().filter((node) => node.type === type);

	return childs.length ? childs : null;
}

/**
 * Calculation chain of selectors to mixins.
 *
 * .a > .b {
 *   .c(@a) {
 *     // Mixin definition
 *   }
 * }
 *
 * parentSelectors = '.a > .b'
 *
 * @param {INode} node
 * @returns {string}
 */
export function getParentSelectors(node: INode): string {
	let parentNode = node.getParent();
	let parentSelectors: string[] = [];

	while (true) {
		if (parentNode.type === NodeType.Stylesheet) {
			break;
		}

		if (parentNode.type === NodeType.Ruleset) {
			parentSelectors.unshift(parentNode.getSelectors().getText());
		}

		parentNode = parentNode.getParent();
	}

	return parentSelectors.length ? parentSelectors.join(' ') : null;
}
