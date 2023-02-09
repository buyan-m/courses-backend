import * as mongoose from 'mongoose'
const connectionPath = process.env.MONGO_CONNECTION_PATH

export const databaseProvider = {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
        mongoose.connect(connectionPath)
}
