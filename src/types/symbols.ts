'use strict';

import { TextDocument } from 'vscode-languageserver';
import { INode } from './nodes';

export interface IVariable {
	name: string;
	value: string;
	offset: number;
	mixin: string;
}

export interface IMixin {
	name: string;
	parameters: IVariable[];
	parent: string;
	offset: number;
}

export interface ISymbols {
	document?: string;
	ctime?: Date;
	variables: IVariable[];
	mixins: IMixin[];
	imports: string[];
}

export interface IDocument {
	ast: INode;
	symbols: ISymbols;
}

export interface IServerDocument {
	textDocument: TextDocument;
	path: string;
	offset: number;
	word: string;
	textBeforeWord: string;
}
