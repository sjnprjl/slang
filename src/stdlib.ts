import { Environment } from "./environment.ts";
import { SlangCallable } from "./types.ts";

export const global = new Environment({
  variables: {
    out: {
      arity: Infinity,
      call(...args: any[]) {
        console.log(...args.map((arg) => arg.toString()));
      },
      toString() {
        return "<native function>";
      },
      valueOf() {
        return null;
      },
    } as SlangCallable,
    str: {
      arity: 1,
      call(str: unknown) {
        return str + "";
      },
    } as SlangCallable,
  },
});
