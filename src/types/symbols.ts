'use strict';

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

export interface IDocumentCollection {
	symbols: ISymbols[];
	node: INode;
}
