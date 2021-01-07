import { DynamoDB } from 'aws-sdk';
import { Auction } from './types/IAuction';

const dynamodb = new DynamoDB.DocumentClient();

/*
    Получение аукционов, время которых подходит к концу
    Аукцион хранит даты начала и окончания в виде ISO строк
*/

export async function getEndedAuctions() : Promise<Auction[]> {
    const now: Date = new Date();
    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString(),
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    const result = await dynamodb.query(params).promise()
    return result.Items as Auction[];
}
