import type { RouteModel } from '../types'

function reduceMap(
  routes: RouteModel[],
  args?: Record<string, RouteModel>
): Record<string, RouteModel> {
  const patterns = args || {}
  const children: RouteModel[] = []

  for (const route of routes) {
    if (!route.pattern) {
      continue
    }

    patterns[route.pattern] = route

    if (route.children) {
      children.push(...(route.children as RouteModel[]))
    }
  }

  if (children.length > 0) {
    return reduceMap(children, patterns)
  }
  return patterns
}

export { reduceMap }
