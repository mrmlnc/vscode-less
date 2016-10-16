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
					parent: '',
					offset: 0
				},
				{
					name: '.skip',
					parameters: [],
					parent: '.a &',
					offset: 0
				}
			],
			imports: []
		}];

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true
		};

		// Should show all suggestions
		assert.equal(doCompletion('test.less', '@', symbolsList, settings).items.length, 2);

		// Should discard Variables with Ruleset in values
		assert.equal(doCompletion('test.less', '@{', symbolsList, settings).items.length, 1);

		// Should discard Mixins with dynamic selectors
		assert.equal(doCompletion('test.less', '.', symbolsList, settings).items.length, 1);
	});

});
