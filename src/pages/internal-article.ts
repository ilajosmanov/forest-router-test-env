import { h, spec, val } from 'forest'
import { View } from '../effector-router'

export const InternalArticle = View(({ path }) => {
  h('div', () => {
    spec({
      text: val`This is internal article page: ${path}`,
    })
  })
})
