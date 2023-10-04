import { Environment } from "./environment.ts";
import { SlangCallable } from "./types.ts";
import { makeCallable } from "./utils.ts";

export const global = new Environment({
  variables: {
    out: makeCallable({
      arity: Infinity,
      call(...args: any[]) {
        console.log(...args.map((arg) => arg.toString()));
      },

      toString() {
        return "<native function>";
      },
    }),
    str: makeCallable({
      arity: 1,
      call(str: unknown) {
        return str + "";
      },
    }),
  },
});
