'use strict';

import * as assert from 'assert';

import { getCacheStorage } from './cache';

describe('Cache', () => {

	it('Create cache', () => {
		const cache = getCacheStorage();

		assert.equal(typeof cache.dispose, 'function');
	});

	it('Set/Get cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			variables: [],
			mixins: [],
			imports: []
		});

		assert.equal(cache.get('test.less').variables.length, 0);
	});

	it('Drop cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			variables: [],
			mixins: [],
			imports: []
		});

		cache.drop('test.less');

		assert.equal(cache.get('test.less'), null);
	});

	it('Dispose cache', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			variables: [],
			mixins: [],
			imports: []
		});

		cache.dispose();

		assert.equal(cache.get('test.less'), null);
	});

});
