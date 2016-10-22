'use strict';

import {
	CompletionList,
	CompletionItemKind,
	TextDocument,
	Files
} from 'vscode-languageserver';

import { ICache } from '../services/cache';
import { IMixin } from '../types/symbols';
import { ISettings } from '../types/settings';

import { parseDocument } from '../services/parser';
import { getSymbolsCollection } from '../utils/symbols';
import { getCurrentDocumentImportPaths, getDocumentPath } from '../utils/document';
import { getCurrentWord, getLimitedString } from '../utils/string';

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
export function doCompletion(document: TextDocument, offset: number, settings: ISettings, cache: ICache): CompletionList {
	const completions = CompletionList.create([], false);

	const documentPath = Files.uriToFilePath(document.uri) || document.uri;
	if (!documentPath) {
		return null;
	}

	// Drop cache for current document
	cache.drop(documentPath);

	const resource = parseDocument(document, offset);
	const symbolsList = getSymbolsCollection(cache).concat(resource.symbols);
	const documentImports = getCurrentDocumentImportPaths(symbolsList, documentPath);
	const currentWord = getCurrentWord(document.getText(), offset);

	// is .@{NAME}-test { ... }
	const isInterpolationVariable = currentWord.endsWith('@{');

	if (settings.suggestVariables && (currentWord === '@' || isInterpolationVariable)) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(documentPath, symbols.document);
			const isImplicitlyImport = symbols.document !== documentPath && documentImports.indexOf(symbols.document) === -1;

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
	} else if (settings.suggestMixins && (currentWord === '.' || currentWord === '#')) {
		symbolsList.forEach((symbols) => {
			const fsPath = getDocumentPath(documentPath, symbols.document);
			const isImplicitlyImport = symbols.document !== documentPath && documentImports.indexOf(symbols.document) === -1;

			symbols.mixins.forEach((mixin) => {
				// Add 'implicitly' prefix for Path if the file imported implicitly
				let detailPath = fsPath;
				if (isImplicitlyImport) {
					detailPath = `(implicitly) ${detailPath}`;
				}

				completions.items.push({
					label: mixin.name,
					kind: CompletionItemKind.Function,
					detail: detailPath,
					documentation: makeMixinDocumentation(mixin),
					insertText: mixin.name
				});
			});
		});
	}

	return completions;
}
