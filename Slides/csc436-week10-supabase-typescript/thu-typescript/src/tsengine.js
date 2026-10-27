// Loaded on demand the first time a slide needs the live checker.
import { createChecker } from "./tscheck.js";
import es5 from "typescript/lib/lib.es5.d.ts?raw";
import decorators from "typescript/lib/lib.decorators.d.ts?raw";
import decoratorsLegacy from "typescript/lib/lib.decorators.legacy.d.ts?raw";
import core from "typescript/lib/lib.es2015.core.d.ts?raw";
import collection from "typescript/lib/lib.es2015.collection.d.ts?raw";
import iterable from "typescript/lib/lib.es2015.iterable.d.ts?raw";
import symbol from "typescript/lib/lib.es2015.symbol.d.ts?raw";
import wellknown from "typescript/lib/lib.es2015.symbol.wellknown.d.ts?raw";
import promise from "typescript/lib/lib.es2015.promise.d.ts?raw";
import includes from "typescript/lib/lib.es2016.array.include.d.ts?raw";

let instance = null;

export function getChecker() {
  if (!instance) {
    instance = createChecker({
      "lib.es5.d.ts": es5,
      "lib.decorators.d.ts": decorators,
      "lib.decorators.legacy.d.ts": decoratorsLegacy,
      "lib.es2015.core.d.ts": core,
      "lib.es2015.collection.d.ts": collection,
      "lib.es2015.iterable.d.ts": iterable,
      "lib.es2015.symbol.d.ts": symbol,
      "lib.es2015.symbol.wellknown.d.ts": wellknown,
      "lib.es2015.promise.d.ts": promise,
      "lib.es2016.array.include.d.ts": includes,
    });
  }
  return instance;
}
