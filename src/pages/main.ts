import { h, spec, val } from 'forest'
import { View, RouterLink } from '../effector-router'

export const Main = View(({ path }) => {
  h('div', () => {
    RouterLink({
      text: 'To About Page',
      to: '/about',
    })
    spec({
      text: val`This is home page: ${path}`,
    })
  })
})
