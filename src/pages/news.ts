import { Link } from '@/router'
import { createStore } from 'effector-logger'
import { h, list, spec } from 'forest'
import { Component } from '../pkg'

export const News: Component = ({ routerView }) => {
  h('div', () => {
    const $items = createStore([
      { path: '/about/news/hot', id: '1', text: 'Hot' },
      { path: '/about/news/latest', id: '2', text: 'Latest' },
    ])

    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from News page',
    })

    h('nav', () => {
      h('ul', () => {
        list({
          source: $items,
          key: 'id',
          fields: ['path', 'text'],
          fn: ({ fields: [path, text] }) => {
            h('li', () => {
              Link({ text, to: path })
            })
          },
        })
      })
    })

    routerView()
  })
}
