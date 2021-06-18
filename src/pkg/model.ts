import {
  combine,
  createEffect,
  createEvent,
  createStore,
  guard,
  sample,
} from 'effector-logger'
import { createBrowserHistory } from 'history'

import { reduceMap } from './lib/reduce-map'
import { makePatterns } from './lib/sort-patterns'
import { findMap, routeResolve } from './lib/route-resolve'
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

const linkClicked = createEvent<{ path: string; replace?: boolean }>()
const access =
  createEvent<{
    pathname: string
    pattern: string
    replace?: boolean
  }>()

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

const initialized = sample({
  source: $path,
  clock: routerCreated,
  fn: (path, model) => ({
    path,
    map: reduceMap(model),
  }),
})

const resolved = sample({
  source: $routesMetaInfo,
  clock: access,
  fn: (source, clock) => {
    const replace = clock.replace
    const response = routeResolve(source, clock)
    return { ...response, replace }
  },
})

sample({
  clock: guard(resolved, {
    filter: (p) => p.replace !== true && typeof p.replace === 'boolean',
  }),
  fn: ({ url }) => url,
  target: historyPush,
})
sample({
  clock: guard(resolved, {
    filter: (p) => p.replace === true && typeof p.replace === 'boolean',
  }),
  fn: ({ url }) => url,
  target: historyReplace,
})

sample({
  clock: [initialized, resolved],
  fn: ({ map }) => map,
  target: $routesMap,
})

const mapFound = guard({
  source: sample({
    source: { $routesMap, $patterns },
    clock: [linkClicked, initialized],
    fn: (source, { path, ...props }) => {
      const pattern = findMap(path, source.$patterns)
      return pattern
        ? {
            // @ts-ignore
            replace: props.replace ?? undefined,
            pathname: path,
            map: source.$routesMap[pattern],
          }
        : null
    },
  }),
  filter: Boolean,
})

// success case: when current route and him parents have truthy guards
const successCase = guard(mapFound, {
  filter: ({ map }) =>
    Boolean(
      map.guard?.source.getState() &&
        map.parents.every((parent) => parent.guard?.source.getState())
    ),
})

// fail case: when current route or some him parent have falsy guard or

sample({
  source: successCase.map(({ map, ...options }) => ({
    ...options,
    pattern: map.pattern,
  })),
  target: access,
})

export { $path, $routesMap, routerCreated, linkClicked }
