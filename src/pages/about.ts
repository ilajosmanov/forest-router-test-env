import { h, spec, val } from 'forest'
import { RouterLink, View } from '../effector-router'

export const About = View(({ path, routerView }) => {
  h('div', () => {
    RouterLink({
      text: val`To Internal Article with ID: 1`,
      to: '/about/1/internal-article',
    })
    spec({
      text: val`This is about page: ${path}`,
    })

    routerView()
  })
})
