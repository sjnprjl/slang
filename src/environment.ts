/*
 * Let's build a environment
 */

import { SlangCallable } from "./types.ts";

interface IEnvironment {
  parent?: Environment;
  variables?: Record<string, SlangCallable>;
}

export class Environment {
  private variables = new Map();
  private parent?: Environment;

  constructor(option?: IEnvironment) {
    this.parent = option?.parent;
    if (option?.variables) {
      for (const key in option.variables) {
        this.set(key, option.variables[key]);
      }
    }
  }

  set(key: string, value: any) {
    this.variables.set(key, value);
    return value;
  }

  get(key: string) {
    return this.resolve(key);
  }

  setParent(parent: Environment) {
    this.parent = parent;
  }

  resolve(key: string): any {
    if (this.variables.has(key)) return this.variables.get(key);
    if (!this.parent) throw `${key} not defined.`;
    return this.parent.resolve(key);
  }
}
