import { DynamoDB } from 'aws-sdk'
import { Auction } from './types/IAuction'

const dynamodb = new DynamoDB.DocumentClient()

/*
    Установление картинки аукциона, по полученному URL
    Возвращает обновлённый аукцион
*/

export async function setAuctionPictureUrl(id, pictureUrl) : Promise<Auction> {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set pictureUrl = :pictureUrl',
        ExpressionAttributeValues: {
            ':pictureUrl': pictureUrl
        },
        ReturnValues: 'ALL_NEW'
    }

    const result = await dynamodb.update(params).promise()
    return result.Attributes as Auction
}
