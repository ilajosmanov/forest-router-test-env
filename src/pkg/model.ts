import {
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
} from 'effector'
import { createBrowserHistory } from 'history'

import { reduceMap } from './lib/reduce-map'
import { makePatterns } from './lib/sort-patterns'
import { routeResolve } from './lib/route-resolve'
import type { RouteModel } from './types'

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

const $path = createStore(history.location.pathname)
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

/**
 *
 * Get correct path
 *
 */
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

/**
 *
 * Update route map and set active flag for page-components
 *
 */
sample({
  clock: [resolvedPush, resolvedReplace],
  fn: ({ map }) => map,
  target: $routesMap,
})

/**
 *
 * Push path to history API
 *
 */
sample({
  clock: resolvedPush,
  fn: ({ url }) => url,
  target: historyPush,
})
sample({
  clock: resolvedReplace,
  fn: ({ url }) => url,
  target: historyReplace,
})

export { $path, $routesMap, routerCreated, push, replace }
