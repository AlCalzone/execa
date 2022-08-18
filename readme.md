# @esm2cjs/execa

This is a fork of https://github.com/sindresorhus/execa, but automatically patched to support ESM **and** CommonJS, unlike the original repository.

## Install

Use an npm alias to install this package under the original name:

```
npm i execa@npm:@esm2cjs/execa
```

```jsonc
// package.json
"dependencies": {
    "execa": "npm:@esm2cjs/execa"
}
```

> **Note:**
> We strive to use the same versions as the upstream package, used the wrong commit to publish `6.1.0`.
> We fixed it, but had to re-publish this version as `6.1.1-cjs.0`.

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
