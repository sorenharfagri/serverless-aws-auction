import { S3 } from 'aws-sdk'

const s3 = new S3()

/*
    Загрузка картинки на S3
    Принимает буффер картинки в виде base64
*/

export async function uploadPictureToS3(key: string, body: Buffer) : Promise<string>{
    const result = await s3.upload({
        Bucket: process.env.AUCTIONS_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
    }).promise()

    return result.Location;
}