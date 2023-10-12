import { FileReader, SlangCallable } from "./types.ts";
import fs from "node:fs/promises";

export const match = <T>(t: T, a: T[]) => {
  return a.some((b) => b === t);
};

export const zip = <T, U>(a: T[], b: U[]) => a.map((k, i) => [k, b[i]]);

export const makeCallable = (
  callable: Omit<SlangCallable, "kind" | "token">,
) => {
  return { ...callable, kind: "Callable", token: null } as SlangCallable;
};

const bunFileReader = {
  async read(path: string) {
    //@ts-ignore Bun
    const bun = Bun.file(path);
    return await bun.text();
  },
} as FileReader;

export const nodeFileReader = {
  async read(path: string) {
    return await fs.readFile(path, "utf8");
  },
} as FileReader;

export const fileReader = async (
  path: string,
  reader: FileReader = bunFileReader,
) => {
  return await reader.read(path);
};
