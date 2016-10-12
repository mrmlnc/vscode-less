'use strict';

import * as assert from 'assert';

import { mockupMixinNode, mockupVariableNode } from '../test/mockup';
import { makeMixin } from './mixin';

describe('Mixin', () => {

	it('makeMixin', () => {
		const node = <any>mockupMixinNode('.mixin', [
			mockupVariableNode('@one', '1', 10),
			mockupVariableNode('@two', '2', 10)
		], 10);

		const mixin = makeMixin(node);

		assert.equal(mixin.name, '.mixin');
		assert.equal(mixin.offset, 10);
		assert.equal(mixin.arguments.length, 2);

		assert.equal(mixin.arguments[0].name, '@one');
		assert.equal(mixin.arguments[1].name, '@two');
	});

});
