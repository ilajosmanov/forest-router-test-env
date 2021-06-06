import { pathToRegexp } from 'path-to-regexp'

import type { RouteModel } from '../types'

type Maps = {
  routesMap: Record<string, RouteModel>
  patterns: string[]
}

function findMap(target: string, patterns: string[]) {
  return patterns.find((p) => pathToRegexp(p).exec(target))
}

function routeResolve(maps: Maps, href: string) {
  const pattern = findMap(href, maps.patterns)
  const map = { ...maps.routesMap }
  let url = href

  if (pattern) {
    let targetMap = map[pattern]
    url = targetMap.redirect ?? href

    const actualPattern =
      (targetMap.redirect && findMap(targetMap.redirect, maps.patterns)) ||
      pattern

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
