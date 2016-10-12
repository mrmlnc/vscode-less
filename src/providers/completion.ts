'use strict';

import * as path from 'path';

import {
	CompletionList,
	CompletionItemKind
} from 'vscode-languageserver';

import { ISymbols } from '../types/common';

export function doCompletion(currentUri: string, currentWord: string, symbolList: ISymbols[]): CompletionList {
	const completions = CompletionList.create([], false);
	const rootUri = path.dirname(currentUri);

	if (currentWord === '@') {
		symbolList.forEach((symbols) => {
			symbols.variables.forEach((variable) => {
				const docPath = path.relative(rootUri, symbols.document) || 'current';

				completions.items.push({
					label: variable.name,
					kind: CompletionItemKind.Variable,
					detail: 'value: ' + variable.value + ', ' + docPath
				});
			});
		});
	} else if (currentWord === '.' || currentUri === '#') {
		symbolList.forEach((symbols) => {
			symbols.mixins.forEach((mixin) => {
				const docPath = path.relative(rootUri, symbols.document) || 'current';

				completions.items.push({
					label: mixin.name,
					kind: CompletionItemKind.Function,
					detail: docPath,
					insertText: mixin.name + '({{_}});'
				});
			});
		});
	}

	return completions;
}
