import { h, route } from 'forest'
import { createBrowserHistory } from 'history'
import {
  is,
  guard,
  Store,
  sample,
  restore,
  createEvent,
  createStore,
} from 'effector'

import { reduceMap } from './lib/reduce-map'
import { sortPatterns } from './lib/sort-patterns'
import { routeResolve } from './lib/route-resolve'
import type { Route, RouteModel } from './types'

type Attrs = {
  text: string | Store<string>
  to: string | Store<string>
}

function createRouter(routes: Route[]) {
  const history = createBrowserHistory()

  const pathChanged = createEvent<string>()
  const routeMapUpdated = createEvent<RouteModel[]>()

  const $routesMap = createStore<Record<string, RouteModel>>({})
  const $patterns = $routesMap.map((state) => sortPatterns(Object.keys(state)))
  const $path = restore(
    pathChanged,
    history.location.pathname + history.location.search
  )

  $routesMap.on(routeMapUpdated, (_, map) => reduceMap(map))
  pathChanged.watch(history.push)
  history.listen(({ location, action }) => {
    if (action === 'POP') {
      pathChanged(location.pathname)
    }
  })

  sample({
    source: {
      routeMap: $routesMap,
      patterns: $patterns,
    },
    clock: pathChanged,
    fn: routeResolve,
    target: $routesMap,
  })

  sample({
    source: $path,
    clock: routeMapUpdated,
    target: pathChanged,
  })

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

      route.pattern = parent
        ? (parent.pattern + route.path).replace('//', '/')
        : route.path

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

  const Link = ({ text, to: href }: Attrs) => {
    const $value = is.store(href) ? href : createStore(href)
    const trigger = createEvent<MouseEvent>()

    sample({
      source: $value,
      clock: guard({
        source: { $value, $path },
        clock: trigger,
        filter: ({ $value, $path }) => $value !== $path,
      }),
      target: pathChanged,
    })

    h('a', {
      text,
      attr: { href },
      handler: {
        config: { prevent: true },
        on: { click: trigger },
      },
    })
  }

  const routerView = () => {
    traverse(routes as RouteModel[])
    routeMapUpdated(routes as RouteModel[])
  }

  return {
    Link,
    $path,
    routerView,
  }
}

export { createRouter }
