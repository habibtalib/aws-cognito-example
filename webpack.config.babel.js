import { DefinePlugin, optimize } from 'webpack'
import dotenv from 'dotenv'
import { resolve } from 'path'
const { DedupePlugin, UglifyJsPlugin, OccurrenceOrderPlugin } = optimize

dotenv.config()
const exposed = [
  'NODE_ENV',
  'AWS_REGION',
  'AWS_IDENTITYPOOL',
  'AWS_CLIENTAPP'
]
const exposedEnvironment = {}
exposed.forEach(i => { exposedEnvironment[i] = JSON.stringify(process.env[i]) })

const config = {
  devtool: 'eval-source-map',
  entry: {
    client: [
      './client/index.js',
      'webpack/hot/only-dev-server'
    ]
  },
  output: {
    path: resolve(__dirname, './client/webroot/build'),
    publicPath: '/build/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      },
      // gross hack: https://github.com/aws/aws-sdk-js/issues/603
      { test: /aws-sdk/, loaders: ['transform?brfs'] },
      { test: /\.json$/, loaders: ['json'] }
    ]
  },
  plugins: [
    new DedupePlugin(),
    new OccurrenceOrderPlugin(),
    new DefinePlugin({
      'process.env': exposedEnvironment
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(new UglifyJsPlugin())
}

export default config

