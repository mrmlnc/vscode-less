'use strict';

import * as assert from 'assert';

import { mockupVariableNode } from '../test/mockup';
import { makeVariable } from './variable';

describe('Variable', () => {

	it('makeVariable', () => {
		const node = <any>mockupVariableNode('@name', 'value', 10);
		const variable = makeVariable(node);

		assert.equal(variable.name, '@name');
		assert.equal(variable.value, 'value');
		assert.equal(variable.offset, 10);
	});

});
