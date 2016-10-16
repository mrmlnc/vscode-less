'use strict';

import * as fs from 'fs';

/**
 * Read file by specified filepath;
 *
 * @param {string} filepath
 * @returns {Promise<string>}
 */
export function readFile(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data.toString());
		});
	});
}

/**
 * Read file by specified filepath;
 *
 * @param {string} filepath
 * @returns {Promise<fs.Stats>}
 */
export function statFile(filepath: string): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stat) => {
			if (err) {
				return reject(err);
			}

			resolve(stat);
		});
	});
}
