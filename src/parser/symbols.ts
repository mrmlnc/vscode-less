'use strict';

import { INode, NodeType } from '../types/nodes';
import { IVariable, IMixin, ISymbols } from '../types/symbols';

import { makeVariable, makeSetVariable } from './variable';
import { makeMixin } from './mixin';
import { getNodeAtOffset, getParentNodeByType } from '../utils/ast';

/**
 * Get filepath of import.
 *
 * @param {INode} node
 * @returns {string}
 */
function getImportFilepath(node: INode): string {
	let filepath = node.getText().replace(/@import.*["'](.*)["']/, '$1');

	// Skip filepaths:
	//   * @import "file.css";
	//   * @import "@{variable}.less";
	//   * @import "**/*.less"; by `less-plugin-glob`
	if (/css$|@{|\*/g.test(filepath)) {
		return null;
	}
	if (!/less$/.test(filepath)) {
		filepath += '.less';
	}

	return filepath;
}

/**
 * Get all suggestions in file.
 *
 * @export
 * @param {INode} parsedDocument
 * @returns {IOccurrence}
 */
export function findSymbols(parsedDocument: INode): ISymbols {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];
	let imports: string[] = [];

	parsedDocument.accept((node: INode) => {
		if (node.type === NodeType.Import) {
			const filepath = getImportFilepath(node);
			if (filepath) {
				imports.push(filepath);
			}
		} else if (node.type === NodeType.VariableDeclaration && node.getParent().type === NodeType.Stylesheet) {
			if (node.getValue()) {
				variables.push(makeVariable(node));
			}
		} else if (node.type === NodeType.MixinDeclaration) {
			mixins.push(makeMixin(node));
		}

		return true;
	});

	return {
		variables,
		mixins,
		imports
	};
}

/**
 * Get Symbols by offset position.
 *
 * @export
 * @param {INode} parsedDocument
 * @param {number} posOffset
 * @returns {IOccurrence}
 */
export function findSymbolsAtOffset(parsedDocument: INode, offset: number): ISymbols {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];
	let imports: string[] = [];

	let node = getNodeAtOffset(parsedDocument, offset);
	if (!node) {
		return {
			variables,
			mixins,
			imports
		};
	}

	node = node.getParent();
	while (true) {
		if (!node || node.type === NodeType.Stylesheet) {
			break;
		} else if (node.type === NodeType.MixinDeclaration) {
			const mixin = makeMixin(node);

			mixins.push(mixin);
			variables.push(
				...mixin.parameters,
				...makeSetVariable(node)
			);
		} else if (node.type === NodeType.Ruleset) {
			variables.push(...makeSetVariable(node));
		}

		node = node.getParent();
	}

	return {
		variables,
		mixins,
		imports
	};
}
