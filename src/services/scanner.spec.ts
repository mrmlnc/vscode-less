'use strict';

import * as assert from 'assert';

import { getCacheStorage } from './cache';
import { doScanner } from './scanner';
import { ISettings } from '../types/settings';

const cache = getCacheStorage();

describe('Scanner', () => {

	it('Scan', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: []
		};

		return doScanner('./fixtures', cache, options).then((result) => {
			assert.equal(result.symbols.length, 5);
		});
	});

	it('Scan without Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/includes', '**/mixins']
		};

		return doScanner('./fixtures', cache, options).then((result) => {
			assert.equal(result.symbols.length, 2);
		});
	});

	it('Scan with Imported files', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			scannerExclude: ['**/includes', '**/mixins'],
			scanImportedFiles: true
		};

		return doScanner('./fixtures', cache, options).then((result) => {
			assert.equal(result.symbols.length, 5);
		});
	});

});
