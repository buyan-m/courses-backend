import * as mongoose from 'mongoose'
import { StorageItemStatus, StorageItemTypes } from '../Storage/storage.types'

export const StorageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cdate: Date,
    url: String,
    key: String,
    type: {
        type: String,
        enum: Object.keys(StorageItemTypes)
    },
    status: {
        type: String,
        enum: Object.keys(StorageItemStatus)
    }
})
