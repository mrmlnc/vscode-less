'use strict';

import {
	IVariable,
	IMixin,
	IImport,
	parseSymbols
} from 'less-symbols-parser';

import { INode, NodeType } from '../types/nodes';
import { ISymbols } from '../types/symbols';

import { makeVariableCollection } from './variable';
import { makeMixin, makeMixinCollection } from './mixin';
import { getNodeAtOffset } from '../utils/ast';

/**
 * Get all suggestions in file.
 */
export function findSymbols(text: string): ISymbols {
	try {
		return parseSymbols(text);
	} catch (err) {
		return {
			variables: [],
			mixins: [],
			imports: []
		};
	}
}

/**
 * Get Symbols by offset position.
 */
export function findSymbolsAtOffset(parsedDocument: INode, offset: number): ISymbols {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];
	let imports: IImport[] = [];

	let node = getNodeAtOffset(parsedDocument, offset);
	if (!node) {
		return {
			variables,
			mixins,
			imports
		};
	}

	while (true) {
		if (!node || node.type === NodeType.Stylesheet) {
			break;
		} else if (node.type === NodeType.MixinDeclaration) {
			variables.push(...makeMixin(node).parameters);
		} else if (node.type === NodeType.Ruleset || node.type === NodeType.Declarations) {
			variables.push(...makeVariableCollection(node));
			mixins.push(...makeMixinCollection(node));
		}

		node = node.getParent();
	}

	return {
		variables,
		mixins,
		imports
	};
}
