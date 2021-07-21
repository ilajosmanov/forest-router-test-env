import { Store, Event } from 'effector'

export type Route = {
  path: string
  fn: PageCallback
  redirect?: string
  children?: Route[]
  guard?: Guard
}

export type InternalRoute = Route & {
  pattern: string
  parents: InternalRoute[]
  active: boolean
}

type Guard = {
  source: Store<boolean>
  done?: Event<string>
  fail?: Event<string>
}

type PageComponentArgs = {
  path: Store<string>
  routerView: () => void
}

export type LinkAttrs = {
  to: string | Store<string>
  replace?: boolean | Store<boolean>
}

export type RouterLinkAttrs = {
  text: string | Store<string>
  to: string | Store<string>
}

export type PageCallback = (args: PageComponentArgs) => void
