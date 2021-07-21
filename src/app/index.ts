import { h, spec } from 'forest'
import { routerView } from '@/router'

function App() {
  h('div', () => {
    spec({
      attr: {
        class: 'app',
      },
    })
    routerView()
  })
}

export { App }
