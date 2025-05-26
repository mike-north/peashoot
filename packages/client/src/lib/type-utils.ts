export type Nullable<T> = T | null;
export type NullableObject<T> = { [K in keyof T]: Nullable<T[K]> };
