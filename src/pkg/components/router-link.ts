import { createStore, is, Store } from 'effector'
import { h } from 'forest'
import { link } from '../link'

type Attrs = {
  text: string | Store<string>
  to: string | Store<string>
}

function RouterLink({ text, to: href }: Attrs) {
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

export { RouterLink }
