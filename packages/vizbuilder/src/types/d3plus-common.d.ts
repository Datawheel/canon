declare module "d3plus-common" {
  export type Accessor<T> = T | ((d: any, i: number, ctx: any) => T);

  export function assign<T=any>(...args: Partial<T>[]): Partial<T>;
}
