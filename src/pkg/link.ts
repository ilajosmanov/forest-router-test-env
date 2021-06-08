import { combine, createEvent, createStore, guard, is, Store } from 'effector'
import { $path, push, replace } from './model'

type Attrs = {
  to: string | Store<string>
  replace?: boolean | Store<boolean>
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

  const protectedRoute = guard({
    source: $to,
    clock: trigger,
    filter: combine($to, $path, (to, path) => to !== path),
  })

  guard({
    clock: protectedRoute,
    filter: $replace.map((s) => !s),
    target: push,
  })

  guard({
    clock: protectedRoute,
    filter: $replace,
    target: replace,
  })

  return trigger
}

export { link }
