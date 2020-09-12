import { promises as fs } from 'fs'
import yargs from 'yargs'
import { cachePath } from './config'
import { Logger } from './utils/log'
import express from 'express'
import { createServer, IncomingMessage } from 'http'
import { corsMiddleware } from './middleware/cors'
import bodyParser from 'body-parser'
import { Socket } from 'net'
import { join } from 'path'
import { GameServer } from './server/game-server'

export async function main() {
	const logger = new Logger('Main')

	const argv = yargs
		.scriptName('isc-mmo-server')
		.command('', 'Starts the server')
		.option('port', {
			type: 'number',
			alias: 'p',
			default: 8050
		}).argv

	try {
		fs.mkdir(cachePath, { recursive: true })
	} catch (e) {
		logger.error('Failed to create cache path', e)
	}

	const app = express()
	const server = createServer(app)
	const gameServer = new GameServer()

	app.use(corsMiddleware())
	app.use(express.static(join(__dirname, '..', '..', 'static')))
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())
	app.use(bodyParser.raw())

	server.on(
		'upgrade',
		async (request: IncomingMessage, socket: Socket, head: Buffer) => {
			try {
				logger.log('New connection')
				gameServer.handleUpgrade(request, socket, head)
			} catch (e) {
				logger.error(e)
				socket.end()
			}
		}
	)

	return new Promise(resolve => {
		server.listen(argv.port, () => {
			logger.log('Listening on', argv.port)
			resolve()
		})
	})
}
