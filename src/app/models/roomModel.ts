import { RoomInput, RoomPayload } from '@/ts-types/room'

interface RoomConnector {
	createRoom: Function
	getRoomByUserId: Function
	addUserToRoom: Function
}

class Room {
	connector: RoomConnector

	constructor({ connector }: { connector: RoomConnector }) {
		this.connector = connector
	}

	async createRoom(roomInput: RoomInput): Promise<RoomPayload> {
		const room = await this.connector.createRoom(roomInput)
		return room
	}

	async getRoomForUser(userId: string): Promise<RoomPayload> {
		const room = await this.connector.getRoomByUserId(userId)
		return room
	}

	async addUserToRoom(pin: string, userId: string): Promise<RoomPayload> {
		const room = await this.connector.addUserToRoom(pin, userId)
		return room
	}
}

export default Room
