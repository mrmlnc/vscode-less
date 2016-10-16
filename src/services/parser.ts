'use strict';

import * as path from 'path';

import { TextDocument, Files } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { IDocument } from '../types/symbols';

import { findSymbols, findSymbolsAtOffset } from '../parser/symbols';
import { getNodeAtOffset } from '../utils/ast';

// Less Language Service
const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

/**
 * Returns all Symbols in a single document.
 */
export function parseDocument(document: TextDocument, dir: string, offset: number = null): IDocument {
	const ast = <INode>ls.parseStylesheet(document);

	let symbols = findSymbols(ast);
	symbols.document = Files.uriToFilePath(document.uri) || document.uri;

	if (offset) {
		const scopedSymbols = findSymbolsAtOffset(ast, offset);

		symbols.variables = symbols.variables.concat(scopedSymbols.variables);
		symbols.mixins = symbols.mixins.concat(scopedSymbols.mixins);
	}

	symbols.imports = symbols.imports.map((filepath) => {
		return path.join(dir, filepath);
	});

	return {
		symbols,
		ast: offset ? getNodeAtOffset(ast, offset) : null
	};
}
