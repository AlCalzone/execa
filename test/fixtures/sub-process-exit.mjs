#!/usr/bin/env node
import process from 'node:process';
import {execa} from '../../esm/index.js';

const cleanup = process.argv[2] === 'true';
const detached = process.argv[3] === 'true';

const runChild = async () => {
	try {
		await execa('node', ['./test/fixtures/noop.mjs'], {cleanup, detached});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

runChild();
