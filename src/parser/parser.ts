'use strict';

import * as path from 'path';
import * as fs from 'fs';

import { TextDocument, Files } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { INode } from '../types/nodes';
import { ISymbols, IVariable } from '../types/common';
import { ICache } from '../providers/cache';

import { findSymbols, findSymbolsAtOffset } from './symbols';

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
		fs.stat(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data.toString());
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
export function parseDocument(document: TextDocument, offset: number = null): ISymbols {
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

	return symbols;
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
export function parse(document: TextDocument, posOffset: number = null, cache: ICache): Promise<ISymbols[]> {
	function recurse(accum: ISymbols[], next: TextDocument, offset: number): any {
		const fsUri = Files.uriToFilePath(next.uri);
		const root = path.dirname(fsUri || next.uri);

		const symbols = parseDocument(next, offset);

		if (offset === null) {
			cache.set(next.uri, symbols);
		}

		if (symbols.imports.length === 0) {
			return Promise.resolve(symbols);
		} else {
			return Promise.all(symbols.imports.map((filepath) => {
				return statFile(filepath).then((stat) => {
					filepath = path.join(root, filepath);

					const cached = cache.get(filepath);
					if (cached && cached.ctime === stat.ctime) {
						console.log('cached: ' + filepath);
						return cached;
					}

					return readFile(filepath).then((content) => {
						const doc = TextDocument.create(filepath, 'less', 1, content);

						return recurse(accum, doc, null);
					});
				});
			})).then((result) => {
				return result.concat(symbols);
			});
		}
	}

	return recurse([], document, posOffset).then((result) => {
		return Array.isArray(result) ? result : [result];
	});
}
