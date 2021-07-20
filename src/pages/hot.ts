import { h, spec } from 'forest'
import { Component } from '../pkg'

export const Hot: Component = ({ routerView }) => {
  h('div', () => {
    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from Hot page',
    })
    routerView()
  })
}
