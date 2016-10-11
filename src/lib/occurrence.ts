'use strict';

import { NodeType, IVariable, IMixin, INode, IOccurrence } from './types';

import { getVariableDeclaration, getVariableDeclarations } from './variable';
import { getMixinDeclaration } from './mixin';

/**
 * Get all suggestions in file.
 *
 * @export
 * @param {INode} parsedDocument
 * @returns {IOccurrence}
 */
export function findOccurrence(parsedDocument: INode): IOccurrence {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];

	parsedDocument.accept((node: INode) => {
		if (node.type === NodeType.VariableDeclaration && node.getParent().type === NodeType.Stylesheet) {
			variables.push(getVariableDeclaration(node));
		}

		if (node.type === NodeType.MixinDeclaration) {
			mixins.push(getMixinDeclaration(node));
		}

		return true;
	});

	return {
		variables,
		mixins
	};
}

/**
 * Get suggestions by offset position.
 *
 * @export
 * @param {INode} parsedDocument
 * @param {number} posOffset
 * @returns {IOccurrence}
 */
export function findOccurrenceAtOffset(parsedDocument: INode, posOffset: number): IOccurrence {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];

	let candidate: INode = null;
	parsedDocument.accept((node) => {
		if (node.offset === -1 && node.length === -1) {
			return true;
		}
		if (node.offset <= posOffset && node.end >= posOffset) {
			if (!candidate) {
				candidate = node;
			} else if (node.length <= candidate.length) {
				candidate = node;
			}
			return true;
		}
		return false;
	});

	let parentNode = candidate.getParent();
	while (true) {
		if (parentNode.type === NodeType.Stylesheet) {
			break;
		}

		if (parentNode.type === NodeType.MixinDeclaration) {
			const mixin = getMixinDeclaration(parentNode);

			variables.push(
				...mixin.arguments,
				...getVariableDeclarations(parentNode)
			);

			mixins.push(mixin);
		}

		if (parentNode.type === NodeType.Ruleset) {
			variables.push(...getVariableDeclarations(parentNode));
		}

		parentNode = parentNode.getParent();
	}

	return {
		variables,
		mixins
	};
}
