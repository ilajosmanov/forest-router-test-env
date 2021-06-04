import path from 'path'
import viteSvgIcons from 'vite-plugin-svg-icons'
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

type ConfigPayload = {
  command: 'serve' | 'build'
  mode: 'development' | 'production'
}
const config = ({ mode }: ConfigPayload) => {
  const isDev = mode === 'development'

  return {
    mode: process.env.NODE_ENV,
    plugins: [
      vanillaExtractPlugin(),
      viteSvgIcons({
        iconDirs: [path.resolve(__dirname, 'src/assets/vector')],
        symbolId: 'icon-[dir]-[name]',
      }),
      babel({
        include: ['./src/**'],
        extensions: ['.ts', '.tsx'],
        babelHelpers: 'bundled',
      }),
      getBabelOutputPlugin({
        configFile: path.resolve(__dirname, 'babel.config.js'),
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'effector-logger': path.resolve(
          __dirname,
          isDev ? './node_modules/effector-logger' : './node_modules/effector'
        ),
      },
    },
  }
}

export default config
