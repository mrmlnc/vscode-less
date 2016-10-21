'use strict';

import { IVariable as IVar, IMixin as IMix, IImport as IImp } from 'less-symbols-parser';
import { INode } from './nodes';

export interface IVariable extends IVar {
	mixin?: string;
}

export interface IMixin extends IMix {
  // :)
}

export interface IImport extends IImp {
  // :)
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
