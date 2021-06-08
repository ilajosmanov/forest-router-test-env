import { RouterLink } from '@/pkg'
import { routerView } from '@/router'
import { createStore } from 'effector'
import { h, list } from 'forest'

import './styles.css'

function App() {
  h('div', () => {
    const $items = createStore([
      { path: '/', id: '1', text: 'Main' },
      { path: '/about', id: '2', text: 'About' },
    ])

    h('nav', () => {
      h('ul', () => {
        list({
          source: $items,
          key: 'id',
          fields: ['path', 'text'],
          fn: ({ fields: [path, text] }) => {
            h('li', () => {
              RouterLink({ text, to: path })
            })
          },
        })
      })
    })
    routerView()
  })
}

export { App }
