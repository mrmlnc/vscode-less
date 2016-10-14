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

interface ICurrentDocument {
	path: string;
	textDocument: TextDocument;
	offset: number;
}

/**
 * Returns all Symbols in the opened workspase.
 *
 * @export
 * @param {string} root
 * @param {ICache} cache
 * @returns {Promise<ISymbols[]>}
 */
export function
doScanner(root: string, cache: ICache, settings: ISettings, document: ICurrentDocument = null): Promise<IDocumentCollection> {
	const options = {
		root,
		fileFilter: '*.less',
		directoryFilter: settings.directoryFilter,
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
				if (document && document.path === entry.fullPath) {
					return;
				}

				const cached = cache.get(entry.fullPath);
				if (cached && cached.ctime.getTime() >= entry.stat.ctime.getTime()) {
					listOfPromises.push(cached);
					return;
				}

				const doSymbols = readFile(entry.fullPath).then((data) => {
					const doc = TextDocument.create(entry.fullPath, 'less', 1, data);
					const { symbols } = parseDocument(doc, entry.fullParentDir);

					symbols.ctime = entry.stat.ctime;
					cache.set(entry.fullPath, symbols);

					return symbols;
				});

				listOfPromises.push(doSymbols);
			})
			.on('error', (err) => {
				if (settings.showErrors) {
					reject(err);
				}
			})
			.on('end', () => {
				Promise.all(listOfPromises).then((result: ISymbols[]) => {
					resolve(<IDocumentCollection>{
						node: ast,
						symbols: result
					});
				});
			});
	});
}
