'use strict';

import { ISymbols } from '../types/symbols';

/**
 * Returns imports for document.
 *
 * @param {ISymbols[]} symbolList
 * @param {string} currentPath
 * @returns {string[]}
 */
export function getCurrentDocumentImports(symbolList: ISymbols[], currentPath: string): string[] {
	for (let i = 0; i < symbolList.length; i++) {
		if (symbolList[i].document === currentPath) {
			return symbolList[i].imports;
		}
	}

	return [];
}
