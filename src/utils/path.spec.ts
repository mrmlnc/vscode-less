'use strict';

import * as assert from 'assert';

import { getDocumentPath } from './path';

describe('Path', () => {

	it('getDocumentPath', () => {
		assert.equal(getDocumentPath('test/file.less', 'test/includes/a.less'), 'includes\\a.less');
		assert.equal(getDocumentPath('test/includes/a.less', 'test/file.less'), '..\\file.less');
	});

});
