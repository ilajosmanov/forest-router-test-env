import { pathToRegexp } from 'path-to-regexp'

import type { RouteModel } from '../types'

type Maps = {
  routesMap: Record<string, RouteModel>
  patterns: string[]
}

export function findMap(target: string, patterns: string[]) {
  return patterns.find((p) => pathToRegexp(p).exec(target))
}

function routeResolve(
  maps: Maps,
  clock: { pathname: string; pattern: string }
) {
  const map = { ...maps.routesMap }
  let url = clock.pathname

  if (clock.pattern) {
    let targetMap = map[clock.pattern]
    url = targetMap.redirect ?? clock.pathname

    const actualPattern =
      (targetMap.redirect && findMap(targetMap.redirect, maps.patterns)) ||
      clock.pattern

    targetMap = map[actualPattern]
    targetMap.active = true

    const parentPatterns = targetMap.parents.map((p) => p.pattern)

    for (const p of targetMap.parents) {
      p.active = true
    }

    for (const key in map) {
      if (key !== actualPattern && !parentPatterns.includes(key)) {
        map[key].active = false
      }
    }
  }

  return { map, url }
}

export { routeResolve }
