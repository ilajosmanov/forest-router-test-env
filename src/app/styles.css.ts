import { globalStyle } from '@vanilla-extract/css'

globalStyle('*', {
  boxSizing: 'border-box',
})

globalStyle('*::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('html, body', {
  width: '100%',
  height: '100%',
})

globalStyle('body', {
  margin: 0,
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
})

globalStyle('a', {
  margin: '0 10px',
})
