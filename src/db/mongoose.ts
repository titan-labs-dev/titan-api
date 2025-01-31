import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const db = process.env.MONGO_URL

mongoose.connect(db, {
	useCreateIndex: true,
	useNewUrlParser: true,
})
