'use strict';

import * as path from 'path';

/**
 * Returns the path to the document, relative to the current document.
 *
 * @param {string} currentUri
 * @param {string} symbolsUri
 * @returns {string}
 */
export function getDocumentPath(currentUri: string, symbolsUri: string): string {
	const rootUri = path.dirname(currentUri);
	const docPath = path.relative(rootUri, symbolsUri);

	if (docPath === path.basename(currentUri)) {
		return 'current';
	}

	return docPath;
}
