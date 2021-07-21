import { About } from '@/pages/about'
import { Main } from '@/pages/main'
import { InternalArticle } from '@/pages/internal-article'

import { createStore } from 'effector'
import { createEvent } from 'effector-logger'
import { Route } from '../effector-router'

const $test = createStore(true)
const $test1 = createStore(false)
const access = createEvent<string>()
const access1 = createEvent<string>()
const fail1 = createEvent<string>()

const routes: Route[] = [
  { path: '/', fn: Main },
  {
    path: '/about',
    fn: About,
    guard: {
      source: $test,
      done: access,
    },
    children: [
      {
        path: '/:id/internal-article',
        guard: {
          source: $test1,
          done: access1,
          fail: fail1,
        },
        fn: InternalArticle,
      },
    ],
  },
]

export { routes }
