'use strict';

import {
	CompletionList,
	CompletionItemKind
} from 'vscode-languageserver';

import { ISymbols, IMixin } from '../types/symbols';
import { ISettings } from '../types/settings';

import { getCurrentDocumentImports, getDocumentPath } from '../utils/document';
import { getLimitedString } from '../utils/string';

/**
 * Return Mixin as string.
 */
function makeMixinDocumentation(symbol: IMixin): string {
	const args = symbol.parameters.map((item) => `${item.name}: ${item.value}`).join(', ');

	return `${symbol.name}(${args}) {\u2026}`;
}

/**
 * Do Completion :)
 */
export function doCompletion(docPath: string, word: string, symbolsList: ISymbols[], settings: ISettings): CompletionList {
	const completions = CompletionList.create([], false);
	const documentImports = getCurrentDocumentImports(symbolsList, docPath);

	// is .@{NAME}-test { ... }
	const isInterpolationVariable = word.endsWith('@{');

	if (settings.suggestVariables && (word === '@' || isInterpolationVariable)) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(docPath, symbols.document);
			const isImplicitlyImport = symbols.document !== docPath && documentImports.indexOf(symbols.document) === -1;

			symbols.variables.forEach((variable) => {
				// Drop Variable if its value is RuleSet in interpolation
				// .test-@{|cursor}
				if (isInterpolationVariable && variable.value && variable.value.indexOf('{') !== -1) {
					return;
				}

				// Add 'implicitly' prefix for Path if the file imported implicitly
				let detailPath = fsPath;
				if (isImplicitlyImport) {
					detailPath = `(implicitly) ${detailPath}`;
				}

				// Add 'argument from MIXIN_NAME' suffix if Variable is Mixin argument
				let detailText = detailPath;
				if (variable.mixin) {
					detailText = `argument from ${variable.mixin}, ${detailText}`;
				}

				completions.items.push({
					// If variable interpolation, then remove the @ character from label
					label: isInterpolationVariable ? variable.name.slice(-1) : variable.name,
					kind: CompletionItemKind.Variable,
					detail: detailText,
					documentation: getLimitedString(variable.value)
				});
			});
		});
	} else if (settings.suggestMixins && (word === '.' || word === '#')) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(docPath, symbols.document);
			const isImplicitlyImport = symbols.document !== docPath && documentImports.indexOf(symbols.document) === -1;

			symbols.mixins.forEach((mixin) => {
				// Drop Mixin if his parents are calculated dynamically
				if (/[&@{}]/.test(mixin.parent)) {
					return;
				}

				// Make full name
				let fullName = mixin.name;
				if (mixin.parent) {
					fullName = mixin.parent + ' ' + fullName;
				}

				// Add 'implicitly' prefix for Path if the file imported implicitly
				let detailPath = fsPath;
				if (isImplicitlyImport) {
					detailPath = `(implicitly) ${detailPath}`;
				}

				completions.items.push({
					label: fullName,
					kind: CompletionItemKind.Function,
					detail: detailPath,
					documentation: makeMixinDocumentation(mixin),
					insertText: fullName
				});
			});
		});
	}

	return completions;
}
