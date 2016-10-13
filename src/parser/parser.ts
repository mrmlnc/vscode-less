'use strict';

import * as path from 'path';
import * as fs from 'fs';

import { TextDocument, Files } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { ISymbols, IVariable, IParse, IParsedDocument } from '../types/common';
import { ICache } from '../providers/cache';

import { findSymbols, findSymbolsAtOffset, getNodeAtOffset } from './symbols';

// Less Language Service
const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

/**
 * Read file by specified filepath;
 *
 * @param {string} filepath
 * @returns {Promise<string>}
 */
function readFile(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data.toString());
		});
	});
}

/**
 * Read file information by specified filepath;
 *
 * @param {string} filepath
 * @returns {Promise<fs.Stats>}
 */
function statFile(filepath: string): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stat) => {
			if (err) {
				return reject(err);
			}

			resolve(stat);
		});
	});
}


/**
 * Returns all Symbols in a single document.
 *
 * @export
 * @param {TextDocument} document
 * @param {number} [offset=null]
 * @returns {ISymbols}
 */
export function parseDocument(document: TextDocument, offset: number = null): IParsedDocument {
	const ast = <INode>ls.parseStylesheet(document);
	const symbols = findSymbols(ast);

	const fsUri = Files.uriToFilePath(document.uri);
	symbols.document = fsUri || document.uri;

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

	return {
		symbols,
		ast: offset ? ast : null
	};
}

/**
 * Returns all Symbols in a single document, but with finding in the imported files.
 *
 * @export
 * @param {TextDocument} document
 * @param {number} [posOffset=null]
 * @param {ICache} cache
 * @returns {Promise<ISymbols[]>}
 */
export function parse(document: TextDocument, posOffset: number = null, cache: ICache): Promise<IParse> {
	let hoverNode: INode = null;

	// Path of the document from the cache
	let docPath: string;

	function recurse(accum: ISymbols[], next: TextDocument, nextCtime: Date, fromCache: ISymbols, offset: number): any {
		const fsUri = Files.uriToFilePath(next.uri);
		const fsPath = (docPath || fsUri) || next.uri;
		const fsRoot = path.dirname(fsPath);

		// Get document Symbols from File or Cache
		const { ast, symbols } = fromCache === null ? parseDocument(next, offset) : {
			ast: null,
			symbols: fromCache
		};

		// Update cache
		if (offset === null && !fromCache) {
			symbols.ctime = nextCtime;
			cache.set(next.uri, symbols);
		} else if (!fromCache) {
			hoverNode = getNodeAtOffset(ast, posOffset);
		}

		if (symbols.imports.length === 0) {
			return Promise.resolve(symbols);
		}

		return Promise.all(symbols.imports.map((filepath) => {
			filepath = path.join(fsRoot, filepath);

			return statFile(filepath).then((stat) => {
				const cached = cache.get(filepath);

				if (cached && cached.ctime.getTime() >= stat.ctime.getTime()) {
					docPath = cached.document;
					return recurse(accum, next, null, cached, null);
				}

				return readFile(filepath).then((content) => {
					const doc = TextDocument.create(filepath, 'less', 1, content);

					return recurse(accum, doc, stat.ctime, null, null);
				});
			});
		})).then((result) => {
			return accum.concat(...result, symbols);
		});
	}

	return recurse([], document, null, null, posOffset).then((result) => {
		return <IParse>{
			symbols: Array.isArray(result) ? result : [result],
			hoverNode
		};
	});
}
