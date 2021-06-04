import { Route } from '../pkg'

import { Main } from '../pages/main'
import { About } from '../pages/about'
import { News } from '../pages/news'
import { Articles } from '../pages/articles'
import { Latest } from '../pages/latest'
import { Hot } from '../pages/hot'

const routes: Route[] = [
  { path: '/', fn: Main },
  {
    path: '/about',
    fn: About,
    children: [
      { path: '/articles', fn: Articles },
      {
        path: '/news',
        fn: News,
        children: [
          { path: '/latest', fn: Latest },
          { path: '/hot', fn: Hot },
        ],
      },
    ],
  },
]

export { routes }
