'use strict';

import { Position } from 'vscode-languageserver';
import { IVariable as IVar, IMixin as IMix, IImport as IImp } from 'less-symbols-parser';
import { INode } from './nodes';

export interface IVariable extends IVar {
	position?: Position;
	mixin?: string;
}

export interface IMixin extends IMix {
	position?: Position;
}

export interface IImport extends IImp {
	reference?: boolean;
}

export interface ISymbols {
	document?: string;
	ctime?: Date;
	variables: IVariable[];
	mixins: IMixin[];
	imports: IImport[];
}

export interface IDocument {
	ast: INode;
	symbols: ISymbols;
}
