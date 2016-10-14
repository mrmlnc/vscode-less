'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable, IMixin } from '../types/symbols';

import { makeVariable } from './variable';

/**
 * Calculation chain of selectors to mixins.
 *
 * .a > .b {
 *   .c(@a) {
 *     // Mixin definition
 *   }
 * }
 *
 * selectors = '.a > .b'
 *
 * @param {INode} node
 * @returns {string}
 */
export function getParentSelectors(node: INode): string {
	node = node.getParent();
	let selectors: string[] = [];

	while (true) {
		if (!node || node.type === NodeType.Stylesheet) {
			break;
		} else if (node.type === NodeType.Ruleset) {
			selectors.unshift(node.getSelectors().getText());
		}

		node = node.getParent();
	}

	return selectors.length ? selectors.join(' ') : null;
}

/**
 * Returns information about Mixin Declaraion.
 *
 * @param {INode} node
 * @returns {IMixin}
 */
export function makeMixin(node: INode): IMixin {
	const name = node.getName();
	let params: IVariable[] = [];

	node.getParameters().getChildren().forEach((child) => {
		if (child.getName()) {
			params.push(makeVariable(child, name));
		}
	});

	return {
		name,
		parameters: params,
		parent: getParentSelectors(node)
	};
}
