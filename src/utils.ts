import { SlangCallable } from "./types.ts";

export const match = <T>(t: T, a: T[]) => {
  return a.some((b) => b === t);
};

export const zip = <T, U>(a: T[], b: U[]) => a.map((k, i) => [k, b[i]]);

export const makeCallable = (
  callable: Omit<SlangCallable, "kind" | "token">,
) => {
  return { ...callable, kind: "Callable", token: null } as SlangCallable;
};
