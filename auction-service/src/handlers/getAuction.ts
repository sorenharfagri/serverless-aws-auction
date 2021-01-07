import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';
import createError from 'http-errors'
import commonMiddleware from '../lib/commonMiddleware';
import { Auction } from '../lib/types/IAuction'

const dynamodb = new DynamoDB.DocumentClient();

/*
    Вспомогательная функция для получения аукциона по id
    Возвращает найденный аукцион
    Либо же выбрасывает NotFoundError в случае ненахода
*/

export async function getAuctionById(id: string): Promise<Auction> {

    let auction: Auction;

    try {
        const result = await dynamodb.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id }
        }).promise();

        auction = result.Item as Auction;
    } catch (error) {
        console.error(error)
        throw new createError.InternalServerError(error)
    }

    if (!auction) {
        throw new createError.NotFound(`Auction with id: ${id} not found!`)
    }

    return auction;
}

/*
    Получение аукциона по id, который ожидается в параметрах пути
*/

const getAuction: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {

    const { id } = event.pathParameters;
    const auction: Auction = await getAuctionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleware(getAuction)