import { createStore } from 'effector-logger'
import { Route } from '../pkg'

import { Main } from '../pages/main'
import { About } from '../pages/about'
import { News } from '../pages/news'
import { Articles } from '../pages/articles'
import { Latest } from '../pages/latest'
import { Hot } from '../pages/hot'

const $test = createStore(false)

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
        redirect: '/latest',
        guard: {
          source: $test,
        },
        children: [
          { path: '/latest', fn: Latest },
          {
            path: '/:id/hot',
            fn: Hot,
          },
        ],
      },
    ],
  },
]

export { routes }
