'use strict';

export interface IVariable {
	name: string;
	value: string;
	offset: number;
	isMixinArgument?: boolean;
}

export interface IMixin {
	name: string;
	arguments: IVariable[];
	offset: number;
}

export interface ISymbols {
	variables: IVariable[];
	mixins: IMixin[];
	imports: string[];
	document?: string;
}
