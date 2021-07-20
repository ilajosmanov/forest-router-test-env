import {
  Unit,
  Store,
  guard,
  sample,
  createEvent,
  createStore,
  createEffect,
  combine,
  is,
} from 'effector'
import { h, route as render } from 'forest'
import { pathToRegexp } from 'path-to-regexp'
import { createBrowserHistory } from 'history'
import { makePatterns } from './lib/make-patterns'

const history = createBrowserHistory()

const fxPush = createEffect(history.push)
const fxReplace = createEffect(history.replace)

const initialize = createEvent<{ path: string }>()
const linkClicked = createEvent<{ path: string; replace?: boolean }>()
const popUsed = createEvent<string>()
const mapPushed = createEvent<InternalRoute>()
const patternChanged = createEvent<string>()

const $path = createStore(history.location.pathname)

const $routesMap = createStore<Record<string, InternalRoute>>({})
const $patterns = $routesMap.map((state) => makePatterns(state))

history.listen(({ location, action }) => {
  if (action === 'POP') {
    popUsed(location.pathname)
  }
})

$routesMap
  .on(mapPushed, (state, route) => ({
    ...state,
    [route.pattern]: route,
  }))
  .on(patternChanged, (state, pattern) => {
    const map = { ...state }
    const target = map[pattern]
    const keys = Object.keys(state)

    if (map[pattern]) {
      for (const key of keys) {
        if (!target.parents.includes(key)) {
          map[key].active = false
        } else {
          map[key].active = true
        }
      }
      target.active = true
      map[pattern] = target
    }
    return map
  })

$path.on([popUsed, patternChanged], (_, pathname) => pathname)

guard({
  clock: sample({
    source: $patterns,
    clock: [initialize, popUsed.map((path) => ({ path }))],
    fn: (patterns, { path }) => {
      return patterns.find((p) => pathToRegexp(p).exec(path))
    },
  }),
  filter: Boolean,
  target: patternChanged,
})

sample({
  clock: [fxPush.done, fxReplace.done],
  fn: ({ params }) => {
    return params as string
  },
  target: patternChanged,
})

const found = guard({
  clock: sample({
    source: { $routesMap, $patterns },
    clock: linkClicked,
    fn: (source, { path, replace }) => {
      const pattern = source.$patterns.find((p) => pathToRegexp(p).exec(path))
      return !pattern ? null : { ...source.$routesMap[pattern], replace }
    },
  }),
  filter: Boolean,
})

sample({
  clock: guard(found, {
    filter: ({ replace }) => !replace,
  }),
  fn: ({ pattern, redirect }) => redirect ?? pattern,
  target: fxPush,
})

sample({
  clock: guard(found, {
    filter: ({ replace }) => Boolean(replace),
  }),
  fn: ({ pattern, redirect }) => redirect ?? pattern,
  target: fxReplace,
})

function appendFields(route: Route, parent?: Route) {
  const r = route as InternalRoute
  const p = parent as InternalRoute | undefined
  const result: InternalRoute = { ...r }

  result.active = false
  result.pattern = p ? (p.pattern + r.path).replace('//', '/') : r.path
  result.parents = p ? [...p.parents, p.pattern] : []

  if (r.redirect) {
    result.redirect = (result.pattern + r.redirect).replace('//', '/')
  }

  mapPushed(result)
  return result
}

function traverse(root: InternalRoute, children?: Route[]) {
  render({
    source: $routesMap,
    visible: (t) => {
      return t[root.pattern] && t[root.pattern].active
    },
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

function createRouter(config: Route[]) {
  const routerView = () => {
    for (const route of config) {
      traverse(appendFields(route), route.children)
    }
    initialize({ path: history.location.pathname })
  }

  return {
    routerView,
  }
}

function link<T = unknown>(payload: Attrs) {
  const trigger = createEvent<T>()
  const $to = (
    is.store(payload.to) ? payload.to : createStore(payload.to)
  ) as Store<string>
  const $replace = (
    is.store(payload.replace)
      ? payload.replace
      : createStore(payload.replace || false)
  ) as Store<boolean>

  guard({
    source: { path: $to, replace: $replace },
    clock: trigger,
    filter: combine($to, $path, (to, path) => to !== path),
    target: linkClicked,
  })

  return trigger
}

function RouterLink({ text, to: href }: RouterLinkPayload) {
  const $value = (is.store(href) ? href : createStore(href)) as Store<string>
  const trigger = link<MouseEvent>({
    to: $value,
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

type C = ({
  path,
  routerView,
}: {
  path: Store<string>
  routerView: () => void
}) => void
type G = {
  source: Store<boolean>
  done?: Unit<string>
  fail?: Unit<string>
}

type Route = {
  path: string
  fn: C
  redirect?: string
  children?: Route[]
  guard?: G
}

type InternalRoute = Route & {
  pattern: string
  parents: string[]
  active: boolean
}

type Attrs = {
  to: string | Store<string>
  replace?: boolean | Store<boolean>
}

type RouterLinkPayload = {
  text: string | Store<string>
  to: string | Store<string>
}

export { createRouter, link, RouterLink }
