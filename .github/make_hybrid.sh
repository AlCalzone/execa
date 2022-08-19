#!/bin/bash

rm -rf esm cjs
mkdir -p esm cjs

mv lib esm/lib
mv index.js esm/index.js
mv index.d.ts esm/index.d.ts
mv index.test-d.ts esm/index.test-d.ts

# Replace module imports in all js files
modules=( human-signals, is-stream, npm-run-path, onetime, strip-final-newline )
for file in {esm,test}{,/**}/*.js ; do
	for mod in "${modules[@]}" ; do
		sed -i "s#'$mod'#'@esm2cjs/$mod'#g" "$file"
	done
done


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
	| if (.dependencies["human-signals"] | (. == "^4.1.0" or . == "^4.2.0")) then (
		.dependencies["@esm2cjs/human-signals"] = "^4.2.1-cjs.0"
	) else (
		.dependencies["@esm2cjs/human-signals"] = .dependencies["human-signals"]
	) end
	| del(.dependencies["human-signals"])
	| .dependencies["@esm2cjs/is-stream"] = .dependencies["is-stream"]
	| del(.dependencies["is-stream"])
	| if (.dependencies["npm-run-path"] == "^5.1.0") then (
		.dependencies["@esm2cjs/npm-run-path"] = "^5.1.1-cjs.0"
	) else (
		.dependencies["@esm2cjs/npm-run-path"] = .dependencies["npm-run-path"]
	) end
	| del(.dependencies["npm-run-path"])
	| if (.dependencies["onetime"] == "^6.0.0") then (
		.dependencies["@esm2cjs/onetime"] = "^6.0.1-cjs.0"
	) else (
		.dependencies["@esm2cjs/onetime"] = .dependencies["onetime"]
	) end
	| del(.dependencies["onetime"])
	| if (.dependencies["strip-final-newline"] == "^3.0.0") then (
		.dependencies["@esm2cjs/strip-final-newline"] = "^3.0.1-cjs.0"
	) else (
		.dependencies["@esm2cjs/strip-final-newline"] = .dependencies["strip-final-newline"]
	) end
	| del(.dependencies["strip-final-newline"])
	| if (.devDependencies["path-key"]) then (.devDependencies["@esm2cjs/path-key"] = .devDependencies["path-key"]) else . end
	| del(.devDependencies["path-key"])
	| .xo = {ignores: ["cjs", "**/*.test-d.ts", "**/*.d.ts", "test/fixtures"]}
')
echo "$PJSON" > package.json

# Update package.json -> version if upstream forgot to update it
if [[ ! -z "${TAG}" ]] ; then
	VERSION=$(echo "${TAG/v/}")
	PJSON=$(cat package.json | jq --tab --arg VERSION "$VERSION" '.version = $VERSION')
	echo "$PJSON" > package.json
fi

npm i -D @alcalzone/esm2cjs
npm run to-cjs
npm uninstall -D @alcalzone/esm2cjs

PJSON=$(cat package.json | jq --tab 'del(.scripts["to-cjs"])')
echo "$PJSON" > package.json

npm test
