import { h, spec } from 'forest'
import { Component } from '../pkg'

export const Latest: Component = () => {
  h('div', () => {
    spec({
      attr: {
        class: 'page',
      },
      text: 'Hello, from Latest page',
    })
  })
}
