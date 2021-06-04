import { Link } from '@/router'
import { createStore } from 'effector-logger'
import { h, list, spec, val } from 'forest'
import { Component } from '../pkg'

export const About: Component = ({ routerView, path }) => {
  h('div', () => {
    const $items = createStore([
      { path: '/about/news', id: '1', text: 'News' },
      { path: '/about/articles', id: '2', text: 'Articles' },
    ])

    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from About page',
    })

    h('span', {
      text: val`current Path: ${path}`,
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