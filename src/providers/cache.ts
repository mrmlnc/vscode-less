'use strict';

import { ISymbols } from '../types/common';

export interface ICache {
	get: (uri: string) => any;
	set: (uri: string, symbols: ISymbols) => void;
	drop: (uri: string) => void;
	dispose: () => void;
}

export function getCacheStorage(): ICache {
	let storage: any = {};

	return {
		get: (uri: string) => {
			return storage[uri] || null;
		},
		set: (uri: string, symbols: ISymbols) => {
			storage[uri] = symbols;
		},
		drop: (uri: string) => {
			if (storage[uri]) {
				delete storage[uri];
			}
		},
		dispose: () => {
			storage = {};
		}
	};
}
