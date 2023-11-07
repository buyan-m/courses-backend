import { Inject, Injectable } from '@nestjs/common'
import {
    PutObjectCommand, S3Client, DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { Model } from 'mongoose'
import {
    UploadImageInput, Storage, StorageItemTypes, StorageItemStatus, TGetUploadsFilter
} from './storage.types'
import { throwInternalError, throwUnprocessable } from '../utils/errors'
import { TPaginated } from 'types/entities.types'

const GET_UPLOADS_LIMIT = 20

const {
    S3_ENDPOINT,
    S3_ENDPOINT_BUCKETED,
    S3_REGION,
    S3_ACCESS_KEY_ID,
    S3_ACCESS_KEY_SECRET,
    S3_IMAGES_BUCKET
} = process.env

const s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    forcePathStyle: false,
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_ACCESS_KEY_SECRET
    }
})

const mimeTypesToExtensions: Record<string, string> = { 'image/jpeg': 'jpg' }

@Injectable()
export class StorageService {
    constructor(
        @Inject('STORAGE_MODEL')
        private storageModel: Model<Storage>,
    ) {}

    async uploadImage({ file, userId }: UploadImageInput) {
        const extension = mimeTypesToExtensions[file.mimetype]
        if (!extension) {
            throwUnprocessable(`${file.mimetype} is not valid mimetype for image upload`)
        }
        const record = await new this.storageModel({
            userId,
            cdate: new Date(),
            url: '',
            key: '',
            type: StorageItemTypes.image,
            status: StorageItemStatus.active
        })

        const key = `images/${record._id}.${extension}`
        const url = `${S3_ENDPOINT_BUCKETED}/${key}`
        record.url = url
        record.key = key
        record.save()

        const params = {
            Bucket: S3_IMAGES_BUCKET,
            Key: key,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype
        }

        try {
            await s3Client.send(new PutObjectCommand(params))
            return url
        } catch (e) {
            await record.delete()
            throwInternalError()
        }
    }

    async deleteObject(key: string) {
        const params = {
            Bucket: S3_IMAGES_BUCKET,
            Key: key
        }
        await s3Client.send(new DeleteObjectCommand(params))
        await this.storageModel.findOneAndUpdate({ key }, { $set: { status: StorageItemStatus.deleted } })
    }

    async deleteUserData(userId: string) {
        const records = await this.storageModel.find({ userId })

        const promises = records.map(({ key }) => {
            const params = {
                Bucket: S3_IMAGES_BUCKET,
                Key: key
            }
            return s3Client.send(new DeleteObjectCommand(params)).then(() => {
                this.storageModel.findOneAndUpdate({ key }, { $set: { status: StorageItemStatus.deleted } })
            })
        })

        return Promise.allSettled(promises)
    }

    async getUploads({ userId, offset }: TGetUploadsFilter): Promise<TPaginated<Storage>> {
        const countPromise = this.storageModel.find({ userId }).count()
        const uploadsPromise = this.storageModel.find({ userId })
            .sort({ cdate: -1 })
            .skip(offset)
            .limit(GET_UPLOADS_LIMIT)
        return Promise.all([ countPromise, uploadsPromise ]).then(([ count, uploads ]) => {
            return {
                items: uploads,
                count
            }
        })
    }
}
