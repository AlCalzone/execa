# @esm2cjs/execa

This is a fork of https://github.com/sindresorhus/execa, but automatically patched to support ESM **and** CommonJS, unlike the original repository.

## Install

You can use an npm alias to install this package under the original name:

```
npm i execa@npm:@esm2cjs/execa
```

```jsonc
// package.json
"dependencies": {
    "execa": "npm:@esm2cjs/execa"
}
```

but `npm` might dedupe this incorrectly when other packages depend on the replaced package. If you can, prefer using the scoped package directly:

```
npm i @esm2cjs/execa
```

```jsonc
// package.json
"dependencies": {
    "@esm2cjs/execa": "^ver.si.on"
}
```

> **Note:**
> We strive to use the same versions as the upstream package, but unfortunately there is a bit of a learning curve with these things.
> As a result, we had to re-publish `6.1.0` as `6.1.1-cjs.1`.

## Usage

```js
// Using ESM import syntax
import { execa } from "execa";

// Using CommonJS require()
const { execa } = require("execa");
```

For more details, please see the original [repository](https://github.com/sindresorhus/execa).

## Sponsoring

To support my efforts in maintaining the ESM/CommonJS hybrid, please sponsor [here](https://github.com/sponsors/AlCalzone).

To support the original author of the module, please sponsor [here](https://github.com/sindresorhus/execa).
