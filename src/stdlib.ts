import { Environment } from "./environment.ts";
import { SlangArray, SlangCallable } from "./types.ts";
import { makeCallable } from "./utils.ts";

export const global = new Environment({
  variables: {
    clear: makeCallable({
      arity: 0,
      call() {
        console.clear();
      },
    }),

    out: makeCallable({
      arity: Infinity,
      call(...args: any[]) {
        console.log(...args.map((each) => each?.toString?.()));
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

    read: makeCallable({
      arity: 2,
      call(path: string, cb: SlangCallable) {
        const file = Bun.file(path);
        file.text().then((text: string) => {
          cb.call(text);
        });
      },
    }),

    sin: makeCallable({
      arity: 1,
      call(num: number) {
        return Math.sin(num);
      },
    }),

    cos: makeCallable({
      arity: 1,
      call(num: number) {
        return Math.cos(num);
      },
    }),

    ceil: makeCallable({
      arity: 1,
      call(num: number) {
        return Math.ceil(num);
      },
    }),

    floor: makeCallable({
      arity: 1,
      call(num: number) {
        return Math.floor(num);
      },
    }),

    len: makeCallable({
      arity: 1,
      call(a: any) {
        return a.length;
      },
    }),

    at: makeCallable({
      arity: 2,
      call: (v: any, ind: number) => {
        let result = undefined;
        if (v instanceof SlangArray) {
          result = v.value.at(ind);
        } else {
          result = v.at(ind);
        }
        if (result === undefined) throw "cannot find value at index " + ind;
        return result;
      },
    }),

    join: makeCallable({
      arity: 2,
      call(arr: SlangArray, separator: string) {
        if (!(arr instanceof SlangArray)) {
          throw "first parameter should be array type for join function";
        }
        return arr.elements.join(separator);
      },
    }),
  },
});
