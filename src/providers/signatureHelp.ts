'use strict';
import { SignatureHelp, SignatureInformation } from 'vscode-languageserver';

import { IServerDocument, ISymbols, IVariable } from '../types/symbols';

interface IMixinEntry {
	name: string;
	parameters: string[];
}

/**
 * Returns Mixin name and its parameters from line.
 */
function parseMixinAtLine(text: string): IMixinEntry {
	text = text.trim();
	if (text.includes('{')) {
		text = text.slice(text.indexOf('{') + 1, text.length).trim();
	}

	const name = text.match(/(.*)?\(/)[1] || null;
	const paramsString = text.slice(text.indexOf('(') + 1, text.length);

	let parameters = [];
	if (paramsString.length !== 0) {
		parameters = paramsString.split(/,|;/);
	}

	return {
		name,
		parameters
	};
}

/**
 * Do Signature Help :)
 */
export function doSignatureHelp(document: IServerDocument, symbolsList: ISymbols[]): Promise<SignatureHelp> {
	const mixins: { name: string; parameters: IVariable[]; }[] = [];

	// Skip suggestions if the text not include `(` or include `);`
	if (document.textBeforeWord.endsWith(');') || !document.textBeforeWord.includes('(')) {
		return null;
	}

	const entry = parseMixinAtLine(document.textBeforeWord);
	if (!entry.name) {
		return null;
	}

	symbolsList.forEach((symbols) => {
		symbols.mixins.forEach((mixin) => {
			const mixinName = mixin.parent ? mixin.parent + ' ' + mixin.name : mixin.name;

			if (entry.name === mixin.name && mixin.parameters.length >= entry.parameters.length) {
				mixins.push({
					name: mixinName,
					parameters: mixin.parameters
				});
			}
		});
	});

	if (mixins.length === 0) {
		return null;
	}

	const ret: SignatureHelp = {
		activeSignature: 0,
		activeParameter: Math.max(0, entry.parameters.length - 1),
		signatures: []
	};

	mixins.forEach((mixin) => {
		const paramsString = mixin.parameters.map((x) => `${x.name}: ${x.value}`).join(', ');
		const signatureInfo = SignatureInformation.create(`${mixin.name} (${paramsString})`);

		mixin.parameters.forEach((param) => {
			signatureInfo.parameters.push({
				label: param.name,
				documentation: ''
			});
		});

		ret.signatures.push(signatureInfo);
	});

	return Promise.resolve(ret);
}
