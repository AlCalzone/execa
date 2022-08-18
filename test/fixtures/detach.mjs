#!/usr/bin/env node
import process from 'node:process';
import {execa} from '../../esm/index.js';

const subprocess = execa('node', ['./test/fixtures/forever.mjs'], {detached: true});
console.log(subprocess.pid);
process.exit(0);
