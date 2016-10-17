'use strict';

import * as path from 'path';

import * as readdir from 'readdir-enhanced';
import * as micromatch from 'micromatch';

import { TextDocument } from 'vscode-languageserver';
import { ICache } from './cache';
import { INode } from '../types/nodes';
import { IServerDocument, IDocumentCollection, ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';

import { parseDocument } from './parser';
import { readFile, statFile } from '../utils/fs';

interface IFile {
	filepath: string;
	dir: string;
	ctime: Date;
}

interface IDocument {
	path: string;
	textDocument: TextDocument;
	offset: number;
}

/**
 * Returns Symbols for specified document.
 */
function makeSymbolsForDocument(cache: ICache, entry: IFile): Promise<ISymbols> {
	return readFile(entry.filepath).then((data) => {
		const doc = TextDocument.create(entry.filepath, 'less', 1, data);
		const { symbols } = parseDocument(doc, entry.dir);

		symbols.ctime = entry.ctime;
		cache.set(entry.filepath, symbols);

		return symbols;
	});
}

/**
 * Create IFile interface.
 */
function makeEntryFile(filepath: string, ctime: Date): IFile {
	return {
		filepath: filepath,
		dir: path.dirname(filepath),
		ctime
	};
}

/**
 * Returns Symbols from Imported files.
 */
function scannerImportedFiles(cache: ICache, symbolsList: ISymbols[], settings: ISettings): Promise<ISymbols[]> {
	let nesting = 0;

	function recurse(accum: ISymbols[], list: ISymbols[]): any {
		let importedFiles: string[] = [];

		// Prevent an infinite recursion and very deep `@import`
		if (list.length === 0 || (nesting === settings.scanImportedFilesDepth)) {
			return Promise.resolve(accum);
		}

		list.forEach((item) => {
			item.imports.forEach((filepath) => {
				// Not include in list Symbols from parent Symbols
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
				const entry = makeEntryFile(filepath, stat.ctime);

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
 * Filter for files that are found by the scanner.
 */
function scannerFilter(stat: readdir.IEntry, excludePatterns: string[]): boolean {
	if (excludePatterns && micromatch(stat.path, excludePatterns).length !== 0) {
		return false;
	} else if (stat.isFile()) {
		return stat.path.slice(-4) === 'less';
	}

	return true;
}

/**
 * Returns all Symbols in the opened workspase.
 */
export function doScanner(root: string, cache: ICache, settings: ISettings, document?: IServerDocument): Promise<IDocumentCollection> {
	let ast: INode = null;
	const listOfPromises = [];

	if (document) {
		const dir = path.dirname(document.path);
		const resource = parseDocument(document.textDocument, dir, document.offset);

		ast = resource.ast;

		cache.drop(document.path);

		listOfPromises.push(resource.symbols);
	}

	// Expand **/name to  **/name + **/name/** like VS Code
	const excludePatterns = settings.scannerExclude;
	if (settings.scannerExclude) {
		settings.scannerExclude.forEach((pattern) => {
			if (/^\*\*\/([\w\.-]+)\/?$/.test(pattern)) {
				excludePatterns.push(pattern + '/**');
			}
		});
	}

	return new Promise((resolve, reject) => {
		const stream = readdir.readdirStreamStat(root, {
			basePath: path.resolve(root),
			filter: (stat) => scannerFilter(stat, excludePatterns),
			deep: settings.scannerDepth
		});

		stream.on('data', () => {
			// silence
		});

		stream.on('file', (stat: readdir.IEntry) => {
			const entry = makeEntryFile(stat.path, stat.ctime);

			// Skip current Document
			if (document && document.path === entry.filepath) {
				return;
			}

			// Return Cache if it exists and not outdated
			const cached = cache.get(entry.filepath);
			if (cached && cached.ctime.getTime() >= entry.ctime.getTime()) {
				listOfPromises.push(cached);
				return;
			}

			listOfPromises.push(makeSymbolsForDocument(cache, entry));
		});

		stream.on('error', (err) => {
			if (settings.showErrors) {
				reject(err);
			}
		});

		stream.on('end', async () => {
			let projectSymbols: ISymbols[] = [];
			let importedSymbols: ISymbols[] = [];

			try {
				projectSymbols = await Promise.all(listOfPromises);

				if (settings.scanImportedFiles) {
					importedSymbols = await scannerImportedFiles(cache, projectSymbols, settings);
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
