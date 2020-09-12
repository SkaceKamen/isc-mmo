import JSZip from 'jszip'
import { Mesh, Object3D, Texture, TextureLoader } from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ImageDataLoader } from './image-data-loader'
import { Eventor } from './zengine'
import { AudioDataLoader } from './audio-data-loader'
import { AudioTrack } from './audio-track'

const modelLoader = new GLTFLoader()
const textureLoader = new TextureLoader()
const imageLoader = new ImageDataLoader()
const audioLoader = new AudioDataLoader()

enum ResourceType {
	Model = 1,
	Texture,
	Package,
	Sound
}

type ResultCallback<Result, CallbackTarget> = (
	g: Result,
	ctx: { path: string }
) => CallbackTarget

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoaderItem<Result = any, Target = any> = {
	type: ResourceType
	path: string
	container: Target
	loaded: boolean
	loading: boolean
	onResult?: ResultCallback<Result, Target>
}

export class ResourcesLoader<Items extends Record<string, LoaderItem> = {}> {
	loaded = false

	parallel = true

	items = {} as Items

	loaders: Record<ResourceType, (item: LoaderItem) => Promise<unknown>> = {
		[ResourceType.Texture]: this.loadTexture,
		[ResourceType.Model]: this.loadModel,
		[ResourceType.Package]: this.loadPackage,
		[ResourceType.Sound]: this.loadSound
	}

	private package?: JSZip

	addPackage<Name extends string, Target = Object3D>(
		name: Name,
		path: string,
		onResult?: ResultCallback<JSZip, Target>
	): ResourcesLoader<Items & { [key in Name]: LoaderItem<JSZip, Target> }> {
		return this.addItem(name, {
			type: ResourceType.Package,
			container: undefined,
			path,
			loaded: false,
			loading: false,
			onResult
		})
	}

	async loadPackage(item: LoaderItem<JSZip>) {
		const res = await fetch(item.path)
		const pkg = await JSZip.loadAsync(await res.arrayBuffer())

		item.loaded = true
		item.loading = false

		if (item.onResult) {
			item.container = item.onResult(pkg, item)
		} else {
			item.container = pkg
			this.package = pkg
		}
	}

	addModel<Name extends string, Target = Object3D>(
		name: Name,
		path: string,
		onResult?: ResultCallback<GLTF, Target>
	): ResourcesLoader<Items & { [key in Name]: LoaderItem<GLTF, Target> }> {
		return this.addItem(name, {
			type: ResourceType.Model,
			container: new Object3D(),
			path,
			loaded: false,
			loading: false,
			onResult
		})
	}

	addTexture<Name extends string, Target = Texture>(
		name: Name,
		path: string,
		onResult?: ResultCallback<Texture, Target>
	): ResourcesLoader<Items & { [key in Name]: LoaderItem<Texture, Target> }> {
		return this.addItem(name, {
			type: ResourceType.Texture,
			container: new Texture(),
			path,
			loaded: false,
			loading: false,
			onResult
		})
	}

	addAudio<Name extends string, Target = AudioTrack>(
		name: Name,
		path: string,
		onResult?: ResultCallback<AudioTrack, Target>
	): ResourcesLoader<
		Items & { [key in Name]: LoaderItem<AudioTrack, Target> }
	> {
		return this.addItem(name, {
			type: ResourceType.Sound,
			container: undefined,
			path,
			loaded: false,
			loading: false,
			onResult
		})
	}

	addItem<Name extends string>(name: Name, item: LoaderItem) {
		;(this.items as Record<string, LoaderItem>)[name] = item

		return this
	}

	async loadModel(item: LoaderItem<GLTF>) {
		return new Promise(async (resolve, reject) => {
			const onLoad = (gltf: GLTF) => {
				item.loaded = true
				item.loading = false

				if (item.onResult) {
					item.container = item.onResult(gltf, item)
				} else {
					item.container = gltf.scene
				}

				resolve()
			}

			if (this.package) {
				const data = await this.package.file(item.path)?.async('arraybuffer')

				if (!data) {
					throw new Error(`${item.path} not found in asset pack`)
				}

				modelLoader.parse(data, item.path, onLoad)
			} else {
				modelLoader.load(item.path, onLoad, undefined, (err) => reject(err))
			}
		})
	}

	async loadTexture(item: LoaderItem<Texture>) {
		return new Promise(async (resolve, reject) => {
			const onLoad = (texture: Texture) => {
				item.loaded = true
				item.loading = false

				if (item.onResult) {
					item.container = item.onResult(texture, item)
				} else {
					item.container = texture
				}

				resolve()
			}

			if (this.package) {
				const data = await this.package.file(item.path)?.async('arraybuffer')

				if (!data) {
					throw new Error(`${item.path} not found in asset pack`)
				}

				onLoad(await imageLoader.parse(data, item.path))
			} else {
				textureLoader.load(item.path, onLoad, undefined, (err) => reject(err))
			}
		})
	}

	async loadSound(item: LoaderItem<AudioTrack>) {
		return new Promise(async (resolve, reject) => {
			const onLoad = (audio: AudioTrack) => {
				item.loaded = true
				item.loading = false

				if (item.onResult) {
					item.container = item.onResult(audio, item)
				} else {
					item.container = audio
				}

				resolve()
			}

			if (this.package) {
				const data = await this.package.file(item.path)?.async('arraybuffer')

				if (!data) {
					throw new Error(`${item.path} not found in asset pack`)
				}

				try {
					onLoad(await audioLoader.parse(data))
				} catch (e) {
					reject(e)
				}
			} else {
				try {
					onLoad(await audioLoader.load(item.path))
				} catch (e) {
					reject(e)
				}
			}
		})
	}

	async load() {
		if (this.parallel) {
			await Promise.all(
				Object.values(this.items)
					.filter((p) => !p.loading && !p.loaded)
					.map((p) => this.loadItem(p))
			)
		} else {
			for (const item of Object.values(this.items)) {
				if (!item.loading && !item.loaded) {
					await this.loadItem(item)
				}
			}
		}

		this.loaded = true
		this.onLoad.trigger()
	}

	async loadItem(item: LoaderItem) {
		item.loading = true

		return this.loaders[item.type](item)
	}

	get<Name extends keyof Items>(name: Name): Items[Name]['container'] {
		return this.items[name].container
	}

	onLoad = new Eventor()
}

export const extractMesh = (): ResultCallback<GLTF, Mesh> => (g, { path }) => {
	const mesh = findMesh(g.scene, (i) => i instanceof Mesh)

	if (!mesh) {
		throw new Error(`${path}: Failed to extract mesh`)
	}

	console.log(mesh)

	return mesh as Mesh
}

export const extractByName = (name: string): ResultCallback<GLTF, Object3D> => (
	g,
	{ path }
) => {
	const mesh = findMesh(g.scene, (i) => i.name === name)

	if (!mesh) {
		throw new Error(`${path}: Failed to extract object ${name}`)
	}

	return mesh
}

export const findMesh = (s: Object3D, condition: (i: Object3D) => boolean) => {
	let found = undefined as Object3D | undefined

	s.traverse((i) => {
		if (condition(i)) {
			found = i
		}
	})

	return found
}

export const rawGLTF = (): ResultCallback<GLTF, GLTF> => (g) => g
