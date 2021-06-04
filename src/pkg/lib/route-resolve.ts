import { pathToRegexp } from 'path-to-regexp'

import type { RouteModel } from '../types'

type Maps = {
  routeMap: Record<string, RouteModel>
  patterns: string[]
}

function routeResolve(maps: Maps, href: string) {
  const pattern = maps.patterns.find((p) => pathToRegexp(p).exec(href))
  const map = { ...maps.routeMap }

  if (pattern) {
    map[pattern].active = true
    const parentPatterns = map[pattern].parents.map((p) => p.pattern)
    for (const p of map[pattern].parents) {
      p.active = true
    }

    for (const key in map) {
      if (key !== pattern && !parentPatterns.includes(key)) {
        map[key].active = false
      }
    }
  }

  return map
}

export { routeResolve }
