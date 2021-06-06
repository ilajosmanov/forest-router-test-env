import { RouteModel } from '../types'

function toValue(string: string) {
  if (string === '*') return 1e11 // wild
  if (/^:(.*)\?/.test(string)) return 1111 // param optional
  if (/^:(.*)\./.test(string)) return 11 // param w/ suffix
  if (string.startsWith(':')) return 111 // param
  return 1 // static
}

function toRank(string: string) {
  let i = 0,
    out = ''
  const array = string.split('/')
  for (; i < array.length; i++) out += toValue(array[i])
  return (i - 1) / Number(out)
}

function sortPatterns(
  array: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache = {} as Record<string, any>
) {
  // eslint-disable-next-line no-param-reassign
  cache = {}
  return array.sort((a, b) => {
    return (
      (cache[b] = cache[b] || toRank(b)) - (cache[a] = cache[a] || toRank(a))
    )
  })
}

export function makePatterns(map: Record<string, RouteModel>) {
  return sortPatterns(Object.keys(map))
}
