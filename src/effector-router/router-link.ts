import { h } from 'forest'
import { createStore, is, Store } from 'effector'
import { link } from './link'

import type { RouterLinkAttrs } from './types'

export function RouterLink({ text, to: href }: RouterLinkAttrs) {
  const $value = (is.store(href) ? href : createStore(href)) as Store<string>
  const trigger = link<MouseEvent>({
    to: $value,
  })

  h('a', {
    text,
    attr: { href },
    handler: {
      config: { prevent: true },
      on: { click: trigger },
    },
  })
}
