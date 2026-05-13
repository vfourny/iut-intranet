type QueryKeyScalar = string | number | boolean
type QueryKeyFilters = Record<string, unknown>

type QueryKeyTuple<TPrefix extends string> =
  | readonly [TPrefix, ...QueryKeyScalar[]]
  | readonly [TPrefix, ...QueryKeyScalar[], QueryKeyFilters]

export type QueryKey<TPrefix extends string> = Record<
  string,
  (...args: never[]) => QueryKeyTuple<TPrefix>
>
