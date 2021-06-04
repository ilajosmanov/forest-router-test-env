import { createRouter } from '../pkg'
import { routes } from './routes'

const { Link, routerView } = createRouter(routes)

export { Link, routerView }
