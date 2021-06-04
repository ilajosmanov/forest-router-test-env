import { h, spec } from 'forest'

import { dsIcon } from './styles.css'

type Props = {
  name: string
  fill?: string
}

function DsIcon(props: Props) {
  h('svg', () => {
    spec({
      attr: {
        'aria-hidden': true,
        'class': dsIcon,
      },
    })

    h('use', {
      attr: {
        'xlink:href': `#icon-${props.name}`,
        'fill': props.fill ?? null,
      },
    })
  })
}

export { DsIcon }
