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
  merge,
} from 'effector-logger'

import { reduceMap } from './lib/reduce-map'
import { makePatterns } from './lib/sort-patterns'
import { routeResolve } from './lib/route-resolve'
import type { Route, RouteModel } from './types'

type Attrs = {
  text: string | Store<string>
  to: string | Store<string>
}

function createRouter(routes: Route[]) {
  const history = createBrowserHistory()

  /**
   *
   * Internal effects for control history library [this library must be remove in the future]
   *
   */
  const historyPush = createEffect(history.push)
  const historyReplace = createEffect(history.replace)

  /**
   *
   * public interface for change route (push, replace)
   *
   */
  const push = createEvent<string>()
  const replace = createEvent<string>()

  const pathChanged = createEvent<string>()
  const routerCreated = createEvent<RouteModel[]>()

  const $path = createStore(history.location.pathname + history.location.search)
  const $routesMap = createStore<Record<string, RouteModel>>({})

  const $patterns = $routesMap.map(makePatterns)
  const $routesMetaInfo = combine(
    $routesMap,
    $patterns,
    (routesMap, patterns) => ({
      routesMap,
      patterns,
    })
  )

  $path
    .on(pathChanged, (_, pathname) => pathname)
    .on(
      [historyPush.done, historyReplace.done],
      // @ts-ignore
      (_, { params }) => params.pathname ?? params
    )

  history.listen(({ location, action }) => {
    if (action === 'POP') {
      pathChanged(location.pathname)
    }
  })

  /**
   *
   * Make actual routes map when router created. this is necessary in order to avoid
   * multiple calculate routes map.
   * Example: $routesMap.on(mapCreated) -> routerCreated -> actual router map
   *
   */
  sample({
    source: $path,
    clock: routerCreated,
    fn: (path, model) => {
      const routesMap = reduceMap(model)
      const patterns = makePatterns(routesMap)
      const { map } = routeResolve(
        {
          patterns,
          routesMap,
        },
        path
      )

      return map
    },
    target: $routesMap,
  })

  const resolvedPush = sample({
    source: $routesMetaInfo,
    clock: push,
    fn: routeResolve,
  })
  const resolvedReplace = sample({
    source: $routesMetaInfo,
    clock: replace,
    fn: routeResolve,
  })

  sample({
    source: merge([resolvedReplace, resolvedPush]).map(
      (payload) => payload.map
    ),
    target: $routesMap,
  })

  sample({ source: resolvedPush.map(({ url }) => url), target: historyPush })
  sample({
    source: resolvedReplace.map(({ url }) => url),
    target: historyReplace,
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
    routerCreated(routes as RouteModel[])
  }

  return {
    Link,
    $path,
    push,
    replace,
    routerView,
  }
}

export { createRouter }
