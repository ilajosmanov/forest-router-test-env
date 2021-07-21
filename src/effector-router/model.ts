/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createBrowserHistory } from 'history'
import {
  guard,
  split,
  sample,
  createEvent,
  createStore,
  createEffect,
  merge,
} from 'effector-logger'
import { pathToRegexp } from 'path-to-regexp'
import { makePatterns } from './lib/make-patterns'

import type { InternalRoute } from './types'

const history = createBrowserHistory()

const fxPush = createEffect(history.push)
const fxReplace = createEffect(history.replace)

export const routesUpdated = createEvent<InternalRoute>()
export const initialized = createEvent()
export const linkClicked = createEvent<{ path: string; replace?: boolean }>()

const popUsed = createEvent<string>()
const routeChanged = createEvent<InternalRoute>()

export const $path = createStore(history.location.pathname)
export const $routes = createStore<Record<string, InternalRoute>>({})
const $patterns = $routes.map((routes) => makePatterns(routes))

history.listen(({ location, action }) => {
  if (action === 'POP') {
    popUsed(location.pathname)
  }
})

$routes
  .on(routesUpdated, (routes, route) => ({
    ...routes,
    [route.pattern]: route,
  }))
  .on(routeChanged, (state, route) => {
    const map = { ...state }
    const target = map[route.pattern]
    const keys = Object.keys(state)

    if (map[route.pattern]) {
      for (const key of keys) {
        if (!target.parents.some((parent) => parent.pattern === key)) {
          map[key].active = false
        } else {
          map[key].active = true
        }
      }
      target.active = true
      map[route.pattern] = target
    }
    return map
  })

$path
  .on(popUsed, (_, pathname) => pathname)
  .on(
    [fxPush.done, fxReplace.done],
    // @ts-ignore
    (_, { params }) => params.pathname ?? params
  )

const candidateTarget = guard({
  clock: sample({
    source: { $path, $patterns },
    clock: [
      merge([initialized, popUsed]).map((path) => ({
        path,
        action: false,
        replace: undefined,
      })),
      linkClicked.map((payload) => ({
        ...payload,
        action: true,
      })),
    ],
    fn: (source, payload) => {
      const pattern = source.$patterns.find((pattern) => {
        return pathToRegexp(pattern).exec(payload.path || source.$path)
      })
      return {
        ...payload,
        pattern,
      }
    },
  }),
  filter: (payload) => Boolean(payload.pattern),
})

const candidateFound = guard({
  clock: sample({
    source: $routes,
    clock: candidateTarget,
    fn: (routes, candidate) => ({
      ...candidate,
      route: routes[candidate.pattern!],
    }),
  }),
  filter: Boolean,
})

const { fail, done } = split(candidateFound, {
  fail: ({ route }) => !route.guard?.source.getState(),
  done: ({ route }) => {
    const parentsAccess = route.parents.every((parent) =>
      parent.guard?.source.getState()
    )
    return Boolean(parentsAccess) && Boolean(route.guard?.source.getState())
  },
})

const action = guard({
  clock: done,
  filter: (payload) => payload.action,
})

sample({
  clock: guard(action, {
    filter: ({ replace }) => !replace,
  }),
  fn: (payload) => payload.path as string,
  target: fxPush,
})

sample({
  clock: guard(action, {
    filter: ({ replace }) => Boolean(replace),
  }),
  fn: (payload) => payload.path as string,
  target: fxReplace,
})

sample({
  clock: done.map((p) => p.route),
  target: routeChanged,
})

done.watch(({ route }) => {
  if (route.guard?.done) {
    for (const parent of route.parents) {
      if (parent.guard?.done) {
        parent.guard.done(parent.path)
      }
    }
    route.guard.done(route.path)
  }
})

fail.watch(({ route }) => {
  if (route.guard?.fail) {
    route.guard.fail(route.path)
  }
})
