import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa, execaSync, execaCommand, execaCommandSync} from '../esm/index.js';

process.env.PATH = fileURLToPath(new URL('fixtures', import.meta.url)) + path.delimiter + process.env.PATH;

const command = async (t, expected, ...args) => {
	const {command: failCommand} = await t.throwsAsync(execa('fail.mjs', args));
	t.is(failCommand, `fail.mjs${expected}`);

	const {command} = await execa('noop.mjs', args);
	t.is(command, `noop.mjs${expected}`);
};

command.title = (message, expected) => `command is: ${JSON.stringify(expected)}`;

test(command, ' foo bar', 'foo', 'bar');
test(command, ' baz quz', 'baz', 'quz');
test(command, '');

const testEscapedCommand = async (t, expected, args) => {
	const {escapedCommand: failEscapedCommand} = await t.throwsAsync(execa('fail.mjs', args));
	t.is(failEscapedCommand, `fail.mjs ${expected}`);

	const {escapedCommand: failEscapedCommandSync} = t.throws(() => {
		execaSync('fail.mjs', args);
	});
	t.is(failEscapedCommandSync, `fail.mjs ${expected}`);

	const {escapedCommand} = await execa('noop.mjs', args);
	t.is(escapedCommand, `noop.mjs ${expected}`);

	const {escapedCommand: escapedCommandSync} = execaSync('noop.mjs', args);
	t.is(escapedCommandSync, `noop.mjs ${expected}`);
};

testEscapedCommand.title = (message, expected) => `escapedCommand is: ${JSON.stringify(expected)}`;

test(testEscapedCommand, 'foo bar', ['foo', 'bar']);
test(testEscapedCommand, '"foo bar"', ['foo bar']);
test(testEscapedCommand, '"\\"foo\\""', ['"foo"']);
test(testEscapedCommand, '"*"', ['*']);

test('allow commands with spaces and no array arguments', async t => {
	const {stdout} = await execa('command with space.mjs');
	t.is(stdout, '');
});

test('allow commands with spaces and array arguments', async t => {
	const {stdout} = await execa('command with space.mjs', ['foo', 'bar']);
	t.is(stdout, 'foo\nbar');
});

test('execaCommand()', async t => {
	const {stdout} = await execaCommand('node test/fixtures/echo.mjs foo bar');
	t.is(stdout, 'foo\nbar');
});

test('execaCommand() ignores consecutive spaces', async t => {
	const {stdout} = await execaCommand('node test/fixtures/echo.mjs foo    bar');
	t.is(stdout, 'foo\nbar');
});

test('execaCommand() allows escaping spaces in commands', async t => {
	const {stdout} = await execaCommand('command\\ with\\ space.mjs foo bar');
	t.is(stdout, 'foo\nbar');
});

test('execaCommand() allows escaping spaces in arguments', async t => {
	const {stdout} = await execaCommand('node test/fixtures/echo.mjs foo\\ bar');
	t.is(stdout, 'foo bar');
});

test('execaCommand() escapes other whitespaces', async t => {
	const {stdout} = await execaCommand('node test/fixtures/echo.mjs foo\tbar');
	t.is(stdout, 'foo\tbar');
});

test('execaCommand() trims', async t => {
	const {stdout} = await execaCommand('  node test/fixtures/echo.mjs foo bar  ');
	t.is(stdout, 'foo\nbar');
});

test('execaCommandSync()', t => {
	const {stdout} = execaCommandSync('node test/fixtures/echo.mjs foo bar');
	t.is(stdout, 'foo\nbar');
});
