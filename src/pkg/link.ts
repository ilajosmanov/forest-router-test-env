import { combine, createEvent, createStore, guard, is, Store } from 'effector'
import { $path, linkClicked } from './model'

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

  guard({
    source: { path: $to, replace: $replace },
    clock: trigger,
    filter: combine($to, $path, (to, path) => to !== path),
    target: linkClicked,
  })

  return trigger
}

export { link }
