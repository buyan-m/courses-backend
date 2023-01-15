import * as mongoose from 'mongoose'

export const databaseProvider = {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
        mongoose.connect('mongodb://127.0.0.1:27017/primary')
}
