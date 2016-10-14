'use strict';

import * as assert from 'assert';

import { ISymbols } from '../types/symbols';
import { getCurrentDocumentImports } from './document';

describe('Document', () => {

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

});
