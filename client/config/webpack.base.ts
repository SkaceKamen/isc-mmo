// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./preload-webpack-plugin.d.ts" />

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import path, { join } from 'path'
import PreloadWebpackPlugin from 'preload-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { argv } from 'yargs'
import { ENV, getEnvValues, loadEnv } from './lib/env'
import { rootPath, srcPath } from './lib/paths'
import { ZipAssetsPlugin } from './plugins/zip-assets'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(path.join(__dirname, '..', 'package.json'))

// This is reused for .css, .less and module.less
const styleLoaders = (env: ENV, cssConfig?: { modules?: boolean }) => [
	...(env === 'development' ? ['style-loader'] : [MiniCssExtractPlugin.loader]),
	{
		loader: 'css-loader',
		options: cssConfig
	},
	/*{
		loader: 'postcss-loader',
		options: { importLoaders: 1 }
	},*/
	'less-loader'
]

const config = (env: ENV): webpack.Configuration => {
	const bundleAnalysis = !!argv.bundleSize

	// Override server env, used in .env
	if (typeof argv.server === 'string') {
		process.env.SERVER_ENV = argv.server
	}

	// Loads .env files
	loadEnv()

	const babelOptions = {
		presets: [
			[
				'@babel/env',
				{
					modules: false,
					targets:
						'last 2 Chrome versions, last 2 firefox versions, last 2 safari versions'
				}
			]
		],
		plugins: ['@babel/transform-runtime'],
		cacheDirectory: true
	}

	return {
		mode: env,

		stats: {
			all: false,
			colors: true,
			errors: true,
			errorDetails: true,
			timings: true,
			warnings: true
		},

		entry: [srcPath('index.ts')],

		devtool:
			env === 'development'
				? 'cheap-module-eval-source-map'
				: 'nosources-source-map',

		optimization: {
			minimizer: [
				new TerserPlugin({
					cache: true,
					parallel: true,
					sourceMap: true,
					terserOptions: {
						ie8: false
					}
				}),
				new OptimizeCssAssetsPlugin({
					cssProcessorOptions: {
						map: {
							inline: false
						}
					}
				})
			],
			splitChunks: {
				chunks: 'all'
			}
		},

		output: {
			path: path.join(__dirname, '..', 'dist'),
			filename: 'static/js/[name].[hash].bundle.js',
			chunkFilename:
				env === 'production'
					? 'static/js/[name].[contenthash:8].chunk.js'
					: 'static/js/[name].chunk.js'
		},

		module: {
			rules: [
				{
					test: /\.ts(x?)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: babelOptions
						},
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
								compilerOptions: {
									target: 'es2016',
									module: 'esnext'
								}
							}
						}
					]
				},
				{
					test: /\.module\.less$/,
					exclude: /node_modules/,
					use: styleLoaders(env, { modules: true })
				},
				{
					test: /\.less$/,
					exclude: /\.module\.less$/,
					use: styleLoaders(env, { modules: false })
				},
				{
					test: /\.css$/,
					use: styleLoaders(env, { modules: false })
				},
				{
					test: /\.(jpg|png)$/,
					loader: 'file-loader'
				}
			]
		},

		plugins: [
			...(env === 'development'
				? [new webpack.HotModuleReplacementPlugin()]
				: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()]),

			new webpack.DefinePlugin(getEnvValues(env, pkg.version)),

			new HtmlWebpackPlugin({
				template: srcPath('index.html')
			}),

			new PreloadWebpackPlugin({
				rel: 'prefetch'
			}),

			new ForkTsCheckerWebpackPlugin({
				reportFiles: ['src/**/*.{ts,tsx}']
			}),
			new ForkTsCheckerNotifierWebpackPlugin(),

			/*
			new CircularDependencyPlugin({
				exclude: /node_modules/
			}),
			*/

			...(env === 'production'
				? [
						new ZipAssetsPlugin({
							assets: [
								{
									src: rootPath('static', 'models', '*'),
									dst: 'models'
								},
								{
									src: rootPath('static', 'textures', '*'),
									dst: 'textures'
								}
							],
							dst: rootPath('dist', 'assets.zip')
						})
				  ]
				: []),

			...(bundleAnalysis ? [new BundleAnalyzerPlugin()] : [])
		],

		resolve: {
			extensions: ['.js', '.ts', '.tsx'],
			modules: [path.resolve(__dirname, '..', 'node_modules'), 'node_modules'],
			alias: {
				'@shared': srcPath('../../shared/src'),
				'@': srcPath()
			}
		},

		devServer: {
			hot: true,
			historyApiFallback: true,
			contentBase: join(__dirname, '..', 'static')
		}
	}
}

export default config
