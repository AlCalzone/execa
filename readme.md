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
