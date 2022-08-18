#!/usr/bin/env node
import process from 'node:process';
import {execa} from '../../esm/index.js';

const cleanup = process.argv[2] === 'true';
const detached = process.argv[3] === 'true';
const subprocess = execa('node', ['./test/fixtures/forever.mjs'], {cleanup, detached});
process.send(subprocess.pid);
