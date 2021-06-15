import { createStore } from 'effector-logger'
import { route } from 'forest'

import { $path, $routesMap, routerCreated } from './model'

import type { Route, RouteModel } from './types'

function createRouter(routes: Route[]) {
  const render = (config: RouteModel) => {
    route({
      source: $routesMap,
      visible: (map) => map[config.pattern].active,
      fn() {
        // @ts-ignore
        config.fn({
          path: $path.map((p) => p),
        })
      },
    })
  }

  const traverse = (routes: RouteModel[], parent?: RouteModel) => {
    for (const route of routes) {
      route.active = false
      route.parents = [...(parent?.parents || [])]

      if (!route.guard) {
        const source = createStore(true)
        route.guard = { source }
      }

      route.pattern = parent
        ? (parent.pattern + route.path).replace('//', '/')
        : route.path

      if (route.redirect) {
        route.redirect = parent
          ? (route.pattern + route.redirect).replace('//', '/')
          : route.redirect
      }

      if (parent) {
        route.parents.push(parent)
      }

      render({
        ...route,
        fn(args) {
          route.fn({
            ...args,
            routerView: traverse.bind(
              null,
              (route.children || []) as RouteModel[],
              route
            ),
          })
        },
      })
    }
  }

  const routerView = () => {
    traverse(routes as RouteModel[])
    routerCreated(routes as RouteModel[])
  }

  return {
    $path,
    routerView,
  }
}

export { createRouter }
