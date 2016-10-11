'use strict';

export enum NodeType {
	Undefined,
	Identifier,
	Stylesheet,
	Ruleset,
	Selector,
	SimpleSelector,
	SelectorInterpolation,
	SelectorCombinator,
	SelectorCombinatorParent,
	SelectorCombinatorSibling,
	SelectorCombinatorAllSiblings,
	Page,
	PageBoxMarginBox,
	ClassSelector,
	IdentifierSelector,
	ElementNameSelector,
	PseudoSelector,
	AttributeSelector,
	Declaration,
	Declarations,
	Property,
	Expression,
	BinaryExpression,
	Term,
	Operator,
	Value,
	StringLiteral,
	URILiteral,
	EscapedValue,
	Function,
	NumericValue,
	HexColorValue,
	MixinDeclaration,
	MixinReference,
	VariableName,
	VariableDeclaration,
	Prio,
	Interpolation,
	NestedProperties,
	ExtendsReference,
	SelectorPlaceholder,
	Debug,
	If,
	Else,
	For,
	Each,
	While,
	MixinContent,
	Media,
	Keyframe,
	FontFace,
	Import,
	Namespace,
	Invocation,
	FunctionDeclaration,
	ReturnStatement,
	MediaQuery,
	FunctionParameter,
	FunctionArgument,
	KeyframeSelector,
	ViewPort,
	Document
}

export interface INode {
	type: NodeType;
	offset: number;
	length: number;
	end: number;

	identifier: INode;
	parent: INode;
	children: INode[];

	accept: (node: any) => boolean;
	getText: () => string;
	getChildren: () => INode[];
	getChild: (index: number) => INode;
	getParent: () => INode;
	findParent: (type: NodeType) => INode;
	getSelectors: () => INode;
	getParameters: () => INode;
	getName: () => string;
	getValue: () => INode;
	getDefaultValue: () => INode;
}

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

export interface IOccurrence {
	variables: IVariable[];
	mixins: IMixin[];
}
