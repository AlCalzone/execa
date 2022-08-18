#!/bin/bash

rm -rf esm cjs
mkdir -p esm cjs

mv lib esm/lib
mv index.js esm/index.js
mv index.d.ts esm/index.d.ts
mv index.test-d.ts esm/index.test-d.ts

# patch test files to be ESM and look in the right places
for file in test{,/**}/*.js ; do
	sed -i "s#.js#.mjs#g" "$file"
	sed -i -E "s#../lib/([a-zA-Z0-9]+).mjs'#../esm/lib/\1.js'#g" "$file"
	sed -i "s#../index.mjs'#../esm/index.js'#g" "$file"
	mv -- "$file" "${file%.js}.mjs"
done

PJSON=$(cat package.json | jq --tab '
	del(.type)
	| .description = .description + ". This is a fork of " + .repository + ", but with CommonJS support."
	| .repository = "esm2cjs/" + .name
	| .name |= "@esm2cjs/" + .
	| .author = { "name": "Dominic Griesel", "email": "d.griesel@gmx.net" }
	| .publishConfig = { "access": "public" }
	| .funding = "https://github.com/sponsors/AlCalzone"
	| .main = "cjs/index.js"
	| .module = "esm/index.js"
	| .files = ["cjs/", "esm/"]
	| .exports = {}
	| .exports["."].import = "./esm/index.js"
	| .exports["."].require = "./cjs/index.js"
	| .exports["./package.json"] = "./package.json"
	| .types = "esm/index.d.ts"
	| .typesVersions = {}
	| .typesVersions["*"] = {}
	| .typesVersions["*"]["esm/index.d.ts"] = ["esm/index.d.ts"]
	| .typesVersions["*"]["cjs/index.d.ts"] = ["esm/index.d.ts"]
	| .typesVersions["*"]["*"] = ["esm/*"]
	| .scripts["to-cjs"] = "esm2cjs --in esm --out cjs -t node12"
	| .dependencies["human-signals"] = "npm:@esm2cjs/human-signals"
	| .dependencies["is-stream"] |= "npm:@esm2cjs/is-stream@" + .
	| .dependencies["mimic-fn"] |= "npm:@esm2cjs/mimic-fn@" + .
	| .dependencies["npm-run-path"] |= "npm:@esm2cjs/npm-run-path@" + .
	| .dependencies["onetime"] |= "npm:@esm2cjs/onetime@" + .
	| .dependencies["strip-final-newline"] = "npm:@esm2cjs/strip-final-newline"
	| .devDependencies["path-key"] |= "npm:@esm2cjs/path-key@" + .
	| .xo = {ignores: ["cjs", "**/*.test-d.ts", "**/*.d.ts", "test/fixtures"]}
')
echo "$PJSON" > package.json

npm i -D @alcalzone/esm2cjs
npm run to-cjs
npm uninstall -D @alcalzone/esm2cjs

PJSON=$(cat package.json | jq --tab 'del(.scripts["to-cjs"])')
echo "$PJSON" > package.json

# npm test
