/*
 * Let's build a environment
 */

interface IEnvironment {
  parent?: Environment;
}

export class Environment {
  private variables = new Map();
  private parent?: Environment;

  constructor(option?: IEnvironment) {
    this.parent = option?.parent;
  }

  set(key: string, value: any) {
    this.variables.set(key, value);
    return value;
  }

  get(key: string) {
    return this.variables.get(key);
  }

  resolve(key: string): any {
    if (this.variables.has(key)) return this.get(key);
    if (!this.parent) throw `${key} not defined.`;
    return this.parent.resolve(key);
  }
}
