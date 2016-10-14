// Type definitions for readdirp
// Project: https://github.com/thlorenz/readdirp
// Definitions by: Erik Vullings
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "readdirp" {
	function readdirp(options: readdirp.Options): NodeJS.ReadableStream;

	namespace readdirp {
		interface Options {
			root: string;
			fileFilter?: any;
			directoryFilter?: any;
			depth?: number;
		}

		interface Entry {
			// directory in which entry was found (relative to given root)
			parentDir: string;
			// full path to parent directory
			fullParentDir: string;
			// name of the file/directory
			name: string;
			// path to the file/directory (relative to given root)
			path: string;
			// full path to the file/directory found
			fullPath: string;
			// built in stat object
			stat: {
				ctime: Date;
			};
		}
	}
	export = readdirp;

}
