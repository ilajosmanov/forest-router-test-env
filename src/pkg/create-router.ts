import { h, route } from 'forest'
import { createBrowserHistory } from 'history'
import {
  is,
  guard,
  Store,
  sample,
  combine,
  createEvent,
  createStore,
  createEffect,
} from 'effector-logger'

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

  const push = createEffect(history.push)
  const replace = createEffect(history.replace)

  const pathChanged = createEvent<string>()
  const routeMapUpdated = createEvent<RouteModel[]>()

  const $path = createStore(history.location.pathname + history.location.search)
  const $routesMap = createStore<Record<string, RouteModel>>({})

  const $patterns = $routesMap.map((state) => sortPatterns(Object.keys(state)))
  const $routesMetaInfo = combine(
    $routesMap,
    $patterns,
    (routesMap, patterns) => ({
      routesMap,
      patterns,
    })
  )

  $routesMap.on(routeMapUpdated, (_, map) => reduceMap(map))
  $path
    .on(pathChanged, (_, pathname) => pathname)
    // @ts-ignore
    .on([push.done, replace.done], (_, { params }) => params.pathname ?? params)

  history.listen(({ location, action }) => {
    if (action === 'POP') {
      pathChanged(location.pathname)
    }
  })

  sample({
    source: $routesMetaInfo,
    clock: [pathChanged, push, replace],
    fn: (source, to) => {
      // @ts-ignore
      const href: string = to.pathname ?? to
      const { map } = routeResolve(source, href)
      return map
    },
    target: $routesMap,
  })

  sample({
    source: { $routesMetaInfo, $path },
    clock: routeMapUpdated,
    fn: ({ $path, $routesMetaInfo }) => {
      const { url } = routeResolve($routesMetaInfo, $path)
      return url
    },
    target: replace,
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

  const Link = ({ text, to: href }: Attrs) => {
    const $value = is.store(href) ? href : createStore(href)
    const trigger = createEvent<MouseEvent>()

    guard({
      source: $value,
      clock: trigger,
      filter: combine($value, $path, (value, path) => value !== path),
      target: push,
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
