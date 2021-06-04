import { h, spec } from 'forest'
import { Component } from '../pkg'

export const Main: Component = () => {
  h('div', () => {
    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from Main page',
    })
  })
}
