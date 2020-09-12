/* eslint-disable @typescript-eslint/no-unused-vars */
import ZEntity from './entity'

export abstract class Component<Options = never> {
	constructor(public entity: ZEntity, options?: Options) {
		this.start(options)
	}

	start(_options?: Options) {}
	tick(_delta: number) {}
}
