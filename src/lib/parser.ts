'use strict';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService, LanguageService } from 'vscode-css-languageservice';

import { IOccurrence, IVariable, IMixin, INode } from './types';
import { sortByOffset } from './helpers';
import { findOccurrence, findOccurrenceAtOffset } from './occurrence';

function parseDocument(ast: INode, document: TextDocument, offset: number = null, cachedDocument: IOccurrence = null) {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];

	if (cachedDocument) {
		variables = cachedDocument.variables;
		mixins = cachedDocument.mixins;
	} else {
		const occurrence = findOccurrence(ast);

		variables = occurrence.variables;
		mixins = occurrence.mixins;
	}

	if (offset) {
		variables = variables.concat(findOccurrenceAtOffset(ast, offset).variables).sort(sortByOffset);
	}

	return {
		variables,
		mixins
	};
}

export default function parser(document: TextDocument, offset: number = null, cachedDocument: IOccurrence = null): IOccurrence {
	const ls: LanguageService = getLESSLanguageService();

	ls.configure({
		lint: false,
		validate: false
	});

	let ast: INode;
	if (!cachedDocument || offset) {
		ast = <INode>ls.parseStylesheet(document);
	}

	return parseDocument(ast, document, offset, cachedDocument);
}
