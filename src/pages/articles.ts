import { h, spec } from 'forest'
import { Component } from '../pkg'

export const Articles: Component = () => {
  h('div', () => {
    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from Articles page',
    })
  })
}
