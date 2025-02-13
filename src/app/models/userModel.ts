import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { pick } from 'lodash'
import {
	InvalidLoginError,
	UserDoesNotExistError,
} from '../../errors/authErrors'
import {
	UserInput,
	LoginCredentials,
	LoginPayload,
	UserPayload,
	UpdateUserInput,
} from '../../ts-types/user'
import { SALT_ROUNDS, JWT_EXPIRY } from '../../utils/constants'

interface UserConnector {
	getAllUsers: Function
	createUser: Function
	findUserByEmail: Function
	deleteUser: Function
	findUserById: Function
	findUsersByUserIds: Function
	findUserByIdAndUpdate: Function
}

class User {
	connector: UserConnector

	constructor({ connector }: { connector: UserConnector }) {
		this.connector = connector
	}

	async getAllUsers(): Promise<UserPayload[]> {
		return this.connector.getAllUsers()
	}

	async registerUser(userData: UserInput): Promise<UserPayload> {
		const user = await this.connector.findUserByEmail(userData.email)

		if (user) {
			throw new Error('User already exists.')
		}

		const hashedPassword = bcrypt.hashSync(userData.password, SALT_ROUNDS)
		if (hashedPassword) {
			const createdUser = await this.connector.createUser({
				...userData,
				password: hashedPassword,
			})
			return createdUser
		}
		throw new Error('User could not be created.')
	}

	async deleteUser(userId: string): Promise<UserPayload> {
		const user = await this.connector.deleteUser(userId)

		if (!user) {
			throw new UserDoesNotExistError()
		}
		return user
	}

	async login(loginCredentials: LoginCredentials): Promise<LoginPayload> {
		const user = await this.connector.findUserByEmail(loginCredentials.email)

		if (!user) {
			throw new UserDoesNotExistError()
		}

		const passwordMatch = await bcrypt.compare(
			loginCredentials.password,
			user.password,
		)

		if (passwordMatch) {
			const token = jwt.sign(
				{ user: pick(user, ['_id']) },
				process.env.JWT_SECRET,
				{
					expiresIn: JWT_EXPIRY,
				},
			)
			return {
				accessToken: token,
				expiresIn: JWT_EXPIRY,
			}
		}
		throw new InvalidLoginError()
	}

	async getUser(id: string): Promise<UserPayload> {
		const user = await this.connector.findUserById(id)

		if (!user) {
			throw new UserDoesNotExistError()
		}
		return user
	}

	async updateUser(id: string, update: UpdateUserInput): Promise<UserPayload> {
		const user = await this.connector.findUserByIdAndUpdate(id, update)

		if (!user) {
			throw new UserDoesNotExistError()
		}
		return user
	}

	async getUsersByRoom(userIds: string[]): Promise<UserPayload[]> {
		const users = await this.connector.findUsersByUserIds(userIds)
		return users
	}
}

export default User
