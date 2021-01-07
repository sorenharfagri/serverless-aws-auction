import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';
import createError from 'http-errors'
import validator from '@middy/validator'
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema'
import commonMiddleware from '../lib/commonMiddleware';
import { Auction } from '../lib/types/IAuction';


const dynamodb = new DynamoDB.DocumentClient();

/*
    Получение всех аукционов с определенным статусом
    Статус ожидается в querystring
*/

const getAuctions: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    const { status } = event.queryStringParameters;
    let auctions: Auction[];

    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': status,
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    try {
        const result = await dynamodb.query(params).promise();

        auctions = result.Items as Auction[];

    } catch (error) {
        console.error(error)
        throw new createError.InternalServerError(error);
    }


    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
}

export const handler = commonMiddleware(getAuctions)
    .use(validator({
        inputSchema: getAuctionsSchema
    }))