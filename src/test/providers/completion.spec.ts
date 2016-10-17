'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';

import { ISettings } from '../../types/settings';

import { getCacheStorage } from '../../services/cache';
import { doCompletion } from '../../providers/completion';

describe('Providers/Completion', () => {

	it('doCompletion', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
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
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true
		};

		let document = null;

		// Should show all suggestions
		document = TextDocument.create('test.less', 'less', 1, '@');
		assert.equal(doCompletion(document, 1, settings, cache).items.length, 2);

		// Should discard Variables with Ruleset in values
		document = TextDocument.create('test.less', 'less', 1, '@{');
		assert.equal(doCompletion(document, 2, settings, cache).items.length, 1);

		// Should discard Mixins with dynamic selectors
		document = TextDocument.create('test.less', 'less', 1, '.');
		assert.equal(doCompletion(document, 1, settings, cache).items.length, 1);
	});

});
