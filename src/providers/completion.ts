'use strict';

import {
	CompletionList,
	CompletionItemKind
} from 'vscode-languageserver';

import { ISymbols, IVariable, IMixin } from '../types/symbols';
import { ISettings } from '../types/settings';

import { getDocumentPath } from '../utils/path';
import { getCurrentDocumentImports } from '../utils/document';

/**
 * Return Variable value.
 *
 * @param {IVariable} symbol
 * @param {string} fsPath
 * @returns {string}
 */
function makeVariableDocumentation(symbol: IVariable, fsPath: string): string {
	if (!symbol.value) {
		return 'null';
	}

	if (symbol.value.length < 50) {
		return symbol.value;
	}

	return symbol.value.slice(0, 50) + '\u2026';
}

/**
 * Return Mixin as string.
 *
 * @param {IMixin} symbol
 * @param {string} fsPath
 * @returns {string}
 */
function makeMixinDocumentation(symbol: IMixin, fsPath: string): string {
	const args = symbol.parameters.map((item) => `${item.name}: ${item.value}`).join(', ');

	return `${symbol.name}(${args}) {\u2026}`;
}

export function doCompletion(currentPath: string, currentWord: string, symbolsList: ISymbols[], settings: ISettings): CompletionList {
	const completions = CompletionList.create([], false);
	const documentImports = getCurrentDocumentImports(symbolsList, currentPath);

	// is .@{NAME}-test { ... }
	const isInterpolationVariable = currentWord.endsWith('@{');

	if (settings.suggestVariables && (currentWord === '@' || isInterpolationVariable)) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(currentPath, symbols.document);

			symbols.variables.forEach((variable) => {
				// Drop Variable if its value is RuleSet
				if (isInterpolationVariable && variable.value && variable.value.indexOf('{') !== -1) {
					return;
				}

				// Add 'implicitly' prefix for Path if the file imported implicitly
				let detailPath = fsPath;
				if (symbols.document !== currentPath && documentImports.indexOf(symbols.document) === -1) {
					detailPath = `(implicitly) ${detailPath}`;
				}

				// Add 'argument from MIXIN_NAME' suffix if Variable from Mixin
				let detailText = detailPath;
				if (variable.mixin) {
					detailText = `argument from ${variable.mixin}, ${detailText}`;
				}

				completions.items.push({
					// If variable interpolation, then remove the @ character from label
					label: isInterpolationVariable ? variable.name.slice(-1) : variable.name,
					kind: CompletionItemKind.Variable,
					detail: detailText,
					documentation: makeVariableDocumentation(variable, currentPath)
				});
			});
		});
	} else if (settings.suggestMixins && (currentWord === '.' || currentPath === '#')) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(currentPath, symbols.document);

			symbols.mixins.forEach((mixin) => {
				// Drop Mixin if his parents are calculated dynamically
				if (/[&@{}]/.test(mixin.parent)) {
					return;
				}

				// Make full name
				const fullName = mixin.parent ? mixin.parent + ' ' + mixin.name : mixin.name;

				// Add 'implicitly' prefix for Path if the file imported implicitly
				let detailPath = fsPath;
				if (symbols.document !== currentPath && documentImports.indexOf(symbols.document) === -1) {
					detailPath = `(implicitly) ${detailPath}`;
				}

				completions.items.push({
					label: fullName,
					kind: CompletionItemKind.Function,
					detail: detailPath,
					documentation: makeMixinDocumentation(mixin, currentPath),
					insertText: fullName + '({{_}});'
				});
			});
		});
	}

	return completions;
}
