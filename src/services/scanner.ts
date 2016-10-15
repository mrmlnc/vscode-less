'use strict';

import * as path from 'path';
import * as fs from 'fs';

import * as readdirp from 'readdirp';

import { TextDocument } from 'vscode-languageserver';
import { ICache } from './cache';
import { INode } from '../types/nodes';
import { IDocumentCollection, ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';

import { parseDocument } from './parser';

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
 * Read file by specified filepath;
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

interface IDocument {
	path: string;
	textDocument: TextDocument;
	offset: number;
}

/**
 * Returns Symbols for specified document.
 *
 * @param {ICache} cache
 * @param {readdirp.Entry} entry
 * @returns {Promise<ISymbols>}
 */
function makeSymbolsForDocument(cache: ICache, entry: readdirp.Entry): Promise<ISymbols> {
	return readFile(entry.fullPath).then((data) => {
		const doc = TextDocument.create(entry.fullPath, 'less', 1, data);
		const { symbols } = parseDocument(doc, entry.fullParentDir);

		symbols.ctime = entry.stat.ctime;
		cache.set(entry.fullPath, symbols);

		return symbols;
	});
}

/**
 * Returns Symbols from Imported files.
 *
 * @param {ICache} cache
 * @param {ISymbols[]} symbolsList
 * @param {ICurrentDocument} document
 * @returns {Promise<ISymbols[]>}
 */
function scannerImportedFiles(cache: ICache, symbolsList: ISymbols[], document: IDocument, settings: ISettings): Promise<ISymbols[]> {
	let nesting = 0;

	function recurse(accum: ISymbols[], list: ISymbols[]): any {
		let importedFiles: string[] = [];

		// Prevent an infinite recursion and very deep `@import`
		if (list.length === 0 || (nesting === settings.scanImportedFilesDepth)) {
			return Promise.resolve(accum);
		}

		list.forEach((item) => {
			item.imports.forEach((filepath) => {
				for (let i = 0; i < symbolsList.length; i++) {
					if (symbolsList[i].document === filepath) {
						return;
					}
				}

				importedFiles.push(filepath);
			});
		});

		if (importedFiles.length === 0) {
			return Promise.resolve(accum);
		}

		return Promise.all(importedFiles.map((filepath) => {
			const cached = cache.get(filepath);
			if (cached) {
				return cached;
			}

			return statFile(filepath).then((stat) => {
				const entry: readdirp.Entry = <any>{
					fullParentDir: path.dirname(filepath),
					fullPath: filepath,
					stat
				};

				return makeSymbolsForDocument(cache, entry);
			});
		})).then((resultList) => {
			nesting++;

			return recurse(accum.concat(resultList), resultList);
		});
	}

	return recurse([], symbolsList);
}

/**
 * Returns all Symbols in the opened workspase.
 *
 * @export
 * @param {string} root
 * @param {ICache} cache
 * @returns {Promise<ISymbols[]>}
 */
export function doScanner(root: string, cache: ICache, settings: ISettings, document: IDocument = null): Promise<IDocumentCollection> {
	const options = {
		root,
		fileFilter: '*.less',
		directoryFilter: settings.directoryFilter.length === 0 ? null : settings.directoryFilter,
		depth: settings.scannerDepth
	};

	let ast: INode = null;
	let listOfPromises = [];

	if (document) {
		const dir = path.dirname(document.path);
		const resource = parseDocument(document.textDocument, dir, document.offset);

		ast = resource.ast;

		cache.drop(document.path);

		listOfPromises.push(resource.symbols);
	}

	return new Promise((resolve, reject) => {
		readdirp(options)
			.on('data', (entry: readdirp.Entry) => {
				// Skip current Document
				if (document && document.path === entry.fullPath) {
					return;
				}

				// Return Cache if it exists and not outdated
				const cached = cache.get(entry.fullPath);
				if (cached && cached.ctime.getTime() >= entry.stat.ctime.getTime()) {
					listOfPromises.push(cached);
					return;
				}

				listOfPromises.push(makeSymbolsForDocument(cache, entry));
			})
			.on('error', (err) => {
				if (settings.showErrors) {
					reject(err);
				}
			})
			.on('end', async () => {
				let projectSymbols: ISymbols[] = [];
				let importedSymbols: ISymbols[] = [];

				try {
					projectSymbols = await Promise.all(listOfPromises);

					if (settings.scanImportedFiles) {
						importedSymbols = await scannerImportedFiles(cache, projectSymbols, document, settings);
					}
				} catch (err) {
					if (settings.showErrors) {
						reject(err);
					}
				}

				return resolve(<IDocumentCollection>{
					node: ast,
					symbols: projectSymbols.concat(importedSymbols)
				});
			});
	});
}
