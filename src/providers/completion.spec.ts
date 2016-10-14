'use strict';

import * as assert from 'assert';

import { ISymbols } from '../types/symbols';
import { ISettings } from '../types/settings';
import { doCompletion } from './completion';

describe('Completion', () => {

	it('doCompletion', () => {
		const symbolsList: ISymbols[] = [{
			document: 'test.less',
			variables: [
				{
					name: '@test',
					value: null,
					offset: 0,
					mixin: null
				},
				{
					name: '@skip',
					value: '{ content: ""; }',
					offset: 0,
					mixin: null
				}
			],
			mixins: [
				{
					name: '.test',
					parameters: [],
					parent: ''
				},
				{
					name: '.skip',
					parameters: [],
					parent: '.a &'
				}
			],
			imports: []
		}];

		const settings = <ISettings>{
			directoryFilter: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true
		};

		assert.equal(doCompletion('test.less', '@', symbolsList, settings).items.length, 2);
		assert.equal(doCompletion('test.less', '@{', symbolsList, settings).items.length, 1);
		assert.equal(doCompletion('test.less', '.', symbolsList, settings).items.length, 1);
	});

});
