'use strict';

import * as assert from 'assert';

import { getCacheStorage } from './cache';
import { doScanner } from './scanner';
import { ISettings } from '../types/settings';

const cache = getCacheStorage();

describe('Scanner', () => {

	it('doScanner', () => {
		const options = <ISettings>{
			scannerDepth: 10,
			directoryFilter: ['!.git', '!*modules']
		};

		return doScanner('./fixtures', cache, options).then((result) => {
			assert.equal(result.symbols.length, 4);
		});
	});

});
