// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Serializable<Data = any> {
	serialize(): Data
	deserialize(data: Data): void
	afterDeserialize(data: Data): void
}
