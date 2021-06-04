import { Store } from 'effector'

type Args = {
  routerView: () => void
  path: Store<string>
}

export type Component = (args: Args) => void

export type RouteModel = {
  path: string
  fn: Component
  pattern: string
  active: boolean
  parents: RouteModel[]
  children?: Route[]
}

export type Route = Omit<RouteModel, 'pattern' | 'active' | 'parents'>
