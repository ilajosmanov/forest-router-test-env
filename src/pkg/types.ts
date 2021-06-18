import { Store, Unit } from 'effector'

type Args = {
  routerView: () => void
  path: Store<string>
}

export type Component = (args: Args) => void

export type RouteModel = {
  path: string
  active: boolean
  pattern: string
  fn: Component
  parents: RouteModel[]
  redirect?: string
  children?: Route[]
  guard?: {
    // source: boolean | Store<boolean> | (boolean | Store<boolean>)[]
    source: Store<boolean>
    success?: Unit<string>
    fail?: Unit<string>
  }
}

export type Route = Omit<RouteModel, 'pattern' | 'active' | 'parents'>
