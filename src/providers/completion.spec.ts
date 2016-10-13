'use strict';

import * as assert from 'assert';

import { ISymbols } from '../types/common';
import { doCompletion } from './completion';

describe('Completion', () => {

	it('doCompletion', () => {
		const symbolsList: ISymbols[] = [{
			document: 'test.less',
			variables: [{
				name: '@test',
				value: null,
				offset: 0
			}],
			mixins: [{
				name: '.test',
				arguments: [],
				offset: 0
			}],
			imports: []
		}];

		const variables = doCompletion('test.less', '@', symbolsList);

		assert.equal(variables.items.length, 1);

		assert.equal(variables.items[0].label, '@test');
		assert.equal(variables.items[0].kind, 6);
		assert.equal(variables.items[0].detail, 'null, current');

		const mixins = doCompletion('test.less', '.', symbolsList);

		assert.equal(mixins.items.length, 1);

		assert.equal(mixins.items[0].label, '.test');
		assert.equal(mixins.items[0].kind, 3);
		assert.equal(mixins.items[0].detail, 'mixin .test() {…} [current]');
	});

});
