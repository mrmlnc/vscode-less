'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable, IMixin } from '../types/common';

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
			const text = node.getSelectors().getText();
			if (/&#{}/.test(text)) {
				return null;
			}

			selectors.unshift(text);
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
	const args: IVariable[] = node.getParameters().getChildren().map((child) => {
		const defaultValueNode = child.getDefaultValue();

		return <IVariable>{
			name: child.getName(),
			value: defaultValueNode ? defaultValueNode.getText() : null,
			offset: child.offset,
			isMixinArgument: true
		};
	});

	let name = node.getName();
	const parentSelectors = getParentSelectors(node);
	if (parentSelectors) {
		name = parentSelectors + ' ' + name;
	}

	return {
		name,
		arguments: args,
		offset: node.offset
	};
}
