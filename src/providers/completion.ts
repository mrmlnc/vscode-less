'use strict';

import {
	CompletionList,
	CompletionItemKind
} from 'vscode-languageserver';

import { ISymbols, IMixin } from '../types/common';

import { getDocumentPath } from '../utils/path';

/**
 * Return Mixin ad string
 *
 *   * mixin NAME(ARGS) {...} [FILE]
 *
 * @param {IMixin} symbol
 * @param {string} fsUri
 * @returns {string}
 */
function makeMixinLabel(symbol: IMixin, fsUri: string): string {
	const args = symbol.arguments.map((item) => {
		return `${item.name}: ${item.value}`;
	}).join(', ');

	return `mixin ${symbol.name}(${args}) {\u2026} [${fsUri}]`;
}

export function doCompletion(currentUri: string, currentWord: string, symbolList: ISymbols[]): CompletionList {
	const completions = CompletionList.create([], false);

	if (currentWord === '@') {
		symbolList.forEach((symbols) => {
			const fsUri = getDocumentPath(currentUri, symbols.document);

			symbols.variables.forEach((variable) => {
				completions.items.push({
					label: variable.name,
					kind: CompletionItemKind.Variable,
					detail: variable.value + ', ' + fsUri
				});
			});
		});
	} else if (currentWord === '.' || currentUri === '#') {
		symbolList.forEach((symbols) => {
			const fsUri = getDocumentPath(currentUri, symbols.document);

			symbols.mixins.forEach((mixin) => {
				completions.items.push({
					label: mixin.name,
					kind: CompletionItemKind.Function,
					detail: makeMixinLabel(mixin, fsUri),
					insertText: mixin.name + '({{_}});'
				});
			});
		});
	}

	return completions;
}
