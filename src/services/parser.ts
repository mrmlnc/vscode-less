'use strict';

import * as path from 'path';

import { TextDocument, Files } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { IDocument, IVariable } from '../types/symbols';

import { findSymbols, findSymbolsAtOffset, getNodeAtOffset } from '../parser/symbols';

// Less Language Service
const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

/**
 * Returns all Symbols in a single document.
 *
 * @export
 * @param {TextDocument} document
 * @param {string} documentDir
 * @param {number} [offset=null]
 * @returns {IDocument}
 */
export function parseDocument(document: TextDocument, dir: string, offset: number = null): IDocument {
	const ast = <INode>ls.parseStylesheet(document);
	const symbols = findSymbols(ast);

	const documentPath = Files.uriToFilePath(document.uri);
	symbols.document = documentPath || document.uri;

	if (offset) {
		symbols.variables = symbols.variables
			.concat(findSymbolsAtOffset(ast, offset).variables)
			.sort((a: IVariable, b: IVariable) => {
				if (a.offset > b.offset) {
					return -1;
				} else if (a.offset < b.offset) {
					return 1;
				}

				return 0;
			});
	}

	symbols.imports = symbols.imports.map((filepath) => {
		return path.join(dir, filepath);
	});

	return {
		symbols,
		ast: offset ? getNodeAtOffset(ast, offset) : null
	};
}
