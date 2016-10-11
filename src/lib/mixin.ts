'use strict';

import { INode, IMixin, IVariable } from './types';
import { getParentSelectors } from './helpers';

/**
 * Returns information about Mixin Declaraion.
 *
 * @param {INode} node
 * @returns {IMixin}
 */
export function getMixinDeclaration(node: INode): IMixin {
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
