'use strict';

import * as assert from 'assert';

import { ISymbols } from '../../types/symbols';
import { getCurrentDocumentImportPaths, getDocumentPath } from '../../utils/document';

describe('Utils/Document', () => {

	it('getCurrentDocumentImports', () => {
		const symbolsList: ISymbols[] = [
			{
				document: 'a.less',
				mixins: [],
				variables: [],
				imports: [
					{
						filepath: 'b.less',
						css: false,
						modes: [],
						dynamic: false
					}
				]
			},
			{
				document: 'b.less',
				mixins: [],
				variables: [],
				imports: [
					{
						filepath: 'a.less',
						css: false,
						modes: [],
						dynamic: false
					},
					{
						filepath: 'c.less',
						css: false,
						modes: [],
						dynamic: false
					}
				]
			}
		];

		const imports = getCurrentDocumentImportPaths(symbolsList, 'b.less');

		assert.equal(imports.length, 2);
	});

	it('getDocumentPath', () => {
		assert.equal(getDocumentPath('test/file.less', 'test/includes/a.less'), 'includes/a.less');
		assert.equal(getDocumentPath('test/includes/a.less', 'test/file.less'), '../file.less');
	});

});
