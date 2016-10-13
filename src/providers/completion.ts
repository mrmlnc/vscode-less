'use strict';

import * as path from 'path';

import {
	CompletionList,
	CompletionItemKind
} from 'vscode-languageserver';

import { ISymbols } from '../types/common';

function getDocumentPath(currentUri: string, symbolsUri: string): string {
	const rootUri = path.dirname(currentUri);
	const docPath = path.relative(rootUri, symbolsUri);

	if (docPath === path.basename(currentUri)) {
		return 'current';
	}

	return docPath;
}

export function doCompletion(currentUri: string, currentWord: string, symbolList: ISymbols[]): CompletionList {
	const completions = CompletionList.create([], false);

	if (currentWord === '@') {
		symbolList.forEach((symbols) => {
			symbols.variables.forEach((variable) => {
				completions.items.push({
					label: variable.name,
					kind: CompletionItemKind.Variable,
					detail: variable.value + ', ' + getDocumentPath(currentUri, symbols.document)
				});
			});
		});
	} else if (currentWord === '.' || currentUri === '#') {
		symbolList.forEach((symbols) => {
			symbols.mixins.forEach((mixin) => {
				completions.items.push({
					label: mixin.name,
					kind: CompletionItemKind.Function,
					detail: getDocumentPath(currentUri, symbols.document),
					insertText: mixin.name + '({{_}});'
				});
			});
		});
	}

	return completions;
}
