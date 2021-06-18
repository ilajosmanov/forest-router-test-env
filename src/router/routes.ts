import { createEvent, createStore } from 'effector-logger'
import { Route } from '../pkg'

import { Main } from '../pages/main'
import { About } from '../pages/about'
import { News } from '../pages/news'
import { Articles } from '../pages/articles'
import { Latest } from '../pages/latest'
import { Hot } from '../pages/hot'

const $test = createStore(true)

const clock = createEvent<string>()

const routes: Route[] = [
  { path: '/', fn: Main },
  {
    path: '/about',
    fn: About,
    guard: {
      source: $test,
      success: clock,
    },
    children: [
      { path: '/articles', fn: Articles },
      {
        path: '/news',
        fn: News,
        redirect: '/latest',
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
