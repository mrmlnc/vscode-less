'use strict';

import { INode, NodeType } from '../types/nodes';

/**
 * Get Node by offset position.
 *
 * @param {INode} parsedDocument
 * @param {number} posOffset
 * @returns {INode}
 */
export function getNodeAtOffset(parsedDocument: INode, posOffset: number): INode {
	let candidate: INode = null;

	parsedDocument.accept((node) => {
		if (node.offset === -1 && node.length === -1) {
			return true;
		} else if (node.offset <= posOffset && node.end >= posOffset) {
			if (!candidate) {
				candidate = node;
			} else if (node.length <= candidate.length) {
				candidate = node;
			}
			return true;
		}
		return false;
	});

	return candidate;
}

/**
 * Returns the parent Node of the specified type.
 *
 * @param {INode} node
 * @param {NodeType} type
 * @returns {INode}
 */
export function getParentNodeByType(node: INode, type: NodeType): INode {
	node = node.getParent();

	while (true) {
		if (node.type === NodeType.Stylesheet) {
			return null;
		} else if (node.type === type) {
			break;
		}

		node = node.getParent();
	}

	return node;
}
