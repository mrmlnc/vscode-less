'use strict';

import * as assert from 'assert';

import { getCacheStorage } from '../../services/cache';
import { getSymbolsCollection } from '../../utils/symbols';

describe('Utils/Symbols', () => {

	it('getSymbolsCollection', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			document: 'test.less',
			variables: [],
			mixins: [],
			imports: []
		});

		assert.equal(getSymbolsCollection(cache).length, 1);
	});
});
