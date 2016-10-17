'use strict';

import * as assert from 'assert';

import { ISymbols } from '../../types/symbols';
import { getCurrentDocumentImports, getDocumentPath } from '../../utils/document';

describe('Utils/Document', () => {

	it('getCurrentDocumentImports', () => {
		const symbolsList: ISymbols[] = [
			{
				document: 'a.less',
				mixins: [],
				variables: [],
				imports: ['b.less']
			},
			{
				document: 'b.less',
				mixins: [],
				variables: [],
				imports: ['a.less', 'c.less']
			}
		];

		const imports = getCurrentDocumentImports(symbolsList, 'b.less');

		assert.equal(imports.length, 2);
	});

	it('getDocumentPath', () => {
		assert.equal(getDocumentPath('test/file.less', 'test/includes/a.less'), 'includes/a.less');
		assert.equal(getDocumentPath('test/includes/a.less', 'test/file.less'), '../file.less');
	});

});
