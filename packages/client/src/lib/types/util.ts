export type ExtractSymbolPropertyNames<T extends object> = {
  [K in keyof T]: T[K] extends symbol ? K : never;
}[keyof T];

export type Unbranded<T extends object> = Pick<
  T,
  Exclude<keyof T, ExtractSymbolPropertyNames<T>>
>;
