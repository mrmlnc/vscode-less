'use strict';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService, LanguageService } from 'vscode-css-languageservice';

import { NodeType } from './types';

const ls: LanguageService = getLESSLanguageService();

interface INode {
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

interface IVariable {
	name: string;
	value: string;
	offset: number;
	isMixinArgument?: boolean;
}

interface IMixin {
	name: string;
	arguments: IVariable[];
	offset: number;
}

interface IOccurrence {
	variables: IVariable[];
	mixins: IMixin[];
}

function sortByOffset(a: { offset: number }, b: { offset: number }): number {
	if (a.offset > b.offset) {
		return -1;
	} else if (a.offset < b.offset) {
		return 1;
	}

	return 0;
}

/**
 * Calculation chain of selectors to mixins.
 *
 * .a > .b {
 *   .c(@a) {
 *     // Mixin definition
 *   }
 * }
 *
 * parentSelectors = '.a > .b'
 *
 * @param {INode} node
 * @returns {string}
 */
function getParentSelectors(node: INode): string {
	let parentNode = node.getParent();
	let parentSelectors: string[] = [];

	while (true) {
		if (parentNode.type === NodeType.Stylesheet) {
			break;
		}

		if (parentNode.type === NodeType.Ruleset) {
			parentSelectors.unshift(parentNode.getSelectors().getText());
		}

		parentNode = parentNode.getParent();
	}

	return parentSelectors.length ? parentSelectors.join(' ') : null;
}

/**
 * Returns the child Node of the specified type.
 *
 * @param {INode} parent
 * @param {NodeType} type
 * @returns {INode[]}
 */
function getChildByType(parent: INode, type: NodeType): INode[] {
	let childs = parent.getChildren().filter((node) => node.type === type);

	return childs.length ? childs : null;
}

/**
 * Returns information about mixin.
 *
 * @param {INode} node
 * @returns {IMixin}
 */
function getMixinDeclaration(node: INode): IMixin {
	const args: IVariable[] = node.getParameters().getChildren().map((child) => {
		const defaultValueNode = child.getDefaultValue();

		let value = null;
		if (defaultValueNode) {
			value = defaultValueNode.getText();
		}

		return <IVariable>{
			name: child.getName().slice(1),
			value,
			offset: child.offset,
			isMixinArgument: true
		};
	});

	let name = node.getName();
	let parentSelectors = getParentSelectors(node);
	if (parentSelectors && !/&#{}/.test(parentSelectors)) {
		name = parentSelectors + ' ' + name;
	}

	return {
		name,
		arguments: args,
		offset: node.offset
	};
}

function getVariableDeclaration(node: INode): IVariable {
	const name = node.getName().slice(1);
	const value = node.getValue().getText();
	const offset = node.offset;

	return {
		name,
		value,
		offset
	};
}

function getVariableDeclarations(node: INode): IVariable[] {
	const rulesetNode = getChildByType(node, NodeType.Declarations);
	const variableNodes = getChildByType(rulesetNode[0], NodeType.VariableDeclaration);

	if (!variableNodes) {
		return [];
	}

	return variableNodes.map(getVariableDeclaration);
}

function findOccurrence(parsedDocument: INode): IOccurrence {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];

	parsedDocument.accept((node: INode) => {
		if (node.type === NodeType.VariableDeclaration && node.getParent().type === NodeType.Stylesheet) {
			variables.push(getVariableDeclaration(node));
		}

		if (node.type === NodeType.MixinDeclaration) {
			mixins.push(getMixinDeclaration(node));
		}

		return true;
	});

	return {
		variables,
		mixins
	};
}

function findOccurrenceAtOffset(parsedDocument: INode, posOffset: number): IOccurrence {
	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];

	let candidate: INode = null;
	parsedDocument.accept((node) => {
		if (node.offset === -1 && node.length === -1) {
			return true;
		}
		if (node.offset <= posOffset && node.end >= posOffset) {
			if (!candidate) {
				candidate = node;
			} else if (node.length <= candidate.length) {
				candidate = node;
			}
			return true;
		}
		return false;
	});

	let parentNode = candidate.getParent();
	while (true) {
		if (parentNode.type === NodeType.Stylesheet) {
			break;
		}

		if (parentNode.type === NodeType.MixinDeclaration) {
			const mixin = getMixinDeclaration(parentNode);

			variables.push(
				...mixin.arguments,
				...getVariableDeclarations(parentNode)
			);

			mixins.push(mixin);
		}

		if (parentNode.type === NodeType.Ruleset) {
			variables.push(...getVariableDeclarations(parentNode));
		}

		parentNode = parentNode.getParent();
	}

	return {
		variables,
		mixins
	};
}

export default function parser(document: TextDocument, offset: number = null, cachedDocument: IOccurrence = null): IOccurrence {
	ls.configure({
		lint: false,
		validate: false
	});

	let ast: INode;
	if (!cachedDocument || offset) {
		ast = <INode>ls.parseStylesheet(document);
	}

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
		const occurrence = findOccurrenceAtOffset(ast, offset);

		variables = variables.concat(occurrence.variables).sort(sortByOffset);
	}

	return {
		variables,
		mixins
	};
}
