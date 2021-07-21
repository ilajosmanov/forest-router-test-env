/* eslint-disable @typescript-eslint/no-explicit-any, no-param-reassign */

function toValue(string: string) {
  if (string === '*') return 1e11
  if (/^:(.*)\?/.test(string)) return 1111
  if (/^:(.*)\./.test(string)) return 11
  if (string.startsWith(':')) return 111
  return 1
}

function toRank(string: string) {
  let i = 0
  let out = ''
  const array = string.split('/')
  for (; i < array.length; i++) out += toValue(array[i])
  return (i - 1) / Number(out)
}

function sortPatterns(array: string[], cache = {} as Record<string, any>) {
  cache = {}
  return array.sort((a, b) => {
    return (
      (cache[b] = cache[b] || toRank(b)) - (cache[a] = cache[a] || toRank(a))
    )
  })
}

export function makePatterns(map: Record<string, unknown>) {
  return sortPatterns(Object.keys(map))
}
