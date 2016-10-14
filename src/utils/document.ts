'use strict';

import { ISymbols } from '../types/symbols';

/**
 * Returns imports for document.
 *
 * @param {ISymbols[]} symbolsList
 * @param {string} currentPath
 * @returns {string[]}
 */
export function getCurrentDocumentImports(symbolsList: ISymbols[], currentPath: string): string[] {
	for (let i = 0; i < symbolsList.length; i++) {
		if (symbolsList[i].document === currentPath) {
			return symbolsList[i].imports;
		}
	}

	return [];
}
