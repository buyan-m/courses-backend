import { TUserId } from '../types/entities.types'

export enum StorageItemTypes {
    image = 'image'
}
export type UploadImageInput = {
    file: Express.Multer.File,
    userId: TUserId
}

export type Storage = {
    userId: TUserId,
    cdate: Date,
    url: string,
    key: string,
    type: StorageItemTypes,
    status: StorageItemStatus
}

export enum StorageItemStatus {
    deleted = 'deleted',
    active = 'active'
}

export type TGetUploadsFilter = {
    userId: string,
    offset: number
}
