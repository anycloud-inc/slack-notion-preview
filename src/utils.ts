export const getLastElement = <T>(array: T[]): T | undefined => {
  return array.slice(-1)[0]
}

export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null
