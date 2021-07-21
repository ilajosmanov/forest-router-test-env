import { createStore } from 'effector'
import { route as render } from 'forest'
import { $path, $routes, routesUpdated, initialized } from './model'

import type { Route, InternalRoute, PageCallback } from './types'

function cleanSlash(s: string) {
  return s.replace('//', '/')
}

function appendFields(route: Route, parent?: Route) {
  const _route = route as InternalRoute
  const _parent = parent as InternalRoute | undefined
  const result: InternalRoute = {
    ..._route,
    active: false,
  }

  if (_route.redirect) {
    result.redirect = cleanSlash(result.pattern + _route.redirect)
  }

  if (!_route.guard) {
    const source = createStore(true)
    result.guard = { source }
  }

  result.parents = _parent ? [..._parent.parents, _parent] : []
  result.pattern = _parent
    ? cleanSlash(_parent.pattern + _route.path)
    : _route.path

  routesUpdated(result)
  return result
}

function traverse(root: InternalRoute, children?: Route[]) {
  render({
    source: $routes,
    visible: (routes) => routes[root.pattern].active,
    fn() {
      root.fn({
        path: $path,
        routerView() {
          if (children) {
            for (const route of children) {
              traverse(appendFields(route, root), route.children)
            }
          }
        },
      })
    },
  })
}

export function createRouter(routes: Route[]) {
  const routerView = () => {
    for (const route of routes) {
      traverse(appendFields(route), route.children)
    }
    initialized()
  }

  return {
    routerView,
  }
}

export function View(callback: PageCallback) {
  return callback
}

export { link } from './link'
export { RouterLink } from './router-link'

export type { Route }
