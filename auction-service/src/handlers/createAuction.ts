import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { v4 as uuid } from 'uuid';
import { DynamoDB } from 'aws-sdk';
import createError from 'http-errors'
import commonMiddleware from '../lib/commonMiddleware';
import validator from '@middy/validator'
import createAuctionSchema from '../lib/schemas/createAuctionSchema'
import { Auction } from '../lib/types/IAuction'
import { AuctionStatus } from '../lib/types/AuctionStatus.enum'

const dynamodb = new DynamoDB.DocumentClient();

interface BodyParams {
  body: {
    title: string;
  }
}

/*
  Создание аукциона
  В body ожидается название в виде title
  output: Вновь созданный аукцион
*/

const createAuction: APIGatewayProxyHandler = async (event: AWSLambda.APIGatewayProxyEvent & BodyParams): Promise<APIGatewayProxyResult> => {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;

  const now = new Date()
  const endDate = new Date()
  endDate.setHours(now.getHours() + 1);

  const auction: Auction = {
    id: uuid(),
    title,
    status: AuctionStatus.OPEN,
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    seller: email
  }

  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();

  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction)
  .use(validator({
    inputSchema: createAuctionSchema
  }))