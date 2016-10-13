'use strict';

import {
	Hover,
	MarkedString
} from 'vscode-languageserver';

import { INode, NodeType } from '../types/nodes';
import { ISymbols, IVariable, IMixin } from '../types/common';

import { getDocumentPath } from '../utils/path';

/**
 * Returns the parent Node of the specified type.
 *
 * @param {INode} node
 * @param {NodeType} type
 * @returns {INode}
 */
function getParentNodeByType(node: INode, type: NodeType): INode {
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

/**
 * Returns a colored (marked) line for Variable.
 *
 * @param {IVariable} symbol
 * @param {string} fsUri
 * @returns {MarkedString}
 */
function makeVariableAsMarkedString(symbol: IVariable, fsUri: string): MarkedString {
	return {
		language: 'less',
		value: `${symbol.name}: ${symbol.value} [${fsUri}]`
	};
}

/**
 * Returns a colored (marked) line for Mixin.
 *
 * @param {IMixin} symbol
 * @param {string} fsUri
 * @returns {MarkedString}
 */
function makeMixinAsMarkedString(symbol: IMixin, fsUri: string): MarkedString {
	const args = symbol.arguments.map((item) => {
		return `${item.name}: ${item.value}`;
	}).join(', ');

	return {
		language: 'less',
		value: symbol.name + `(${args}) {\u2026} [${fsUri}]`
	};
}

interface ISymbol {
	uri: string;
	info: any;
}

/**
 * Returns the Symbol, if it present in the documents.
 *
 * @param {ISymbols[]} symbolList
 * @param {*} identifier
 * @param {string} currentUri
 * @returns {ISymbol}
 */
function getSymbol(symbolList: ISymbols[], identifier: any, currentUri: string): ISymbol {
	for (let i = 0; i < symbolList.length; i++) {
		const symbols = symbolList[i];
		const symbolsByType = symbols[identifier.type];

		const fsUri = getDocumentPath(currentUri, symbols.document);

		for (let i = 0; i < symbolsByType.length; i++) {
			if (symbolsByType[i].name === identifier.name) {
				return {
					uri: fsUri,
					info: symbolsByType[i]
				};
			}
		}
	}

	return null;
}

export function doHover(currentUri: string, symbolList: ISymbols[], hoverNode: INode): Hover {
	if (!hoverNode || !hoverNode.type) {
		return;
	}

	let identifier: { type: string; name: string; } = null;
	if (hoverNode.type === NodeType.VariableName) {
		identifier = {
			name: hoverNode.getName(),
			type: 'variables'
		};
	} else if (hoverNode.type === NodeType.Identifier) {
		let node = getParentNodeByType(hoverNode, NodeType.MixinDeclaration) || getParentNodeByType(hoverNode, NodeType.MixinReference);
		if (node) {
			identifier = {
				name: node.getName(),
				type: 'mixins'
			};
		}
	}

	if (!identifier) {
		return;
	}

	const symbol = getSymbol(symbolList, identifier, currentUri);
	let contents: MarkedString = '';
	if (symbol) {
		if (identifier.type === 'variables') {
			contents = makeVariableAsMarkedString(symbol.info, symbol.uri);
		} else {
			contents = makeMixinAsMarkedString(symbol.info, symbol.uri);
		}
	}

	return {
		contents
	};
}
