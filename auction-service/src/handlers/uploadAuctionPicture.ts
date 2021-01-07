import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import createError from 'http-errors'
import validator from '@middy/validator'
import cors from '@middy/http-cors'
import { APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'

import { getAuctionById } from './getAuction';
import { uploadPictureToS3 } from '../lib/uploadPictureToS3'
import { setAuctionPictureUrl } from '../lib/setAuctionPicture'
import { Auction } from '../lib/types/IAuction'
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema'

/*
    Загрузка картинки аукциона
    Получает картинку в виде base64 из body, и загружает его в виде jpg на S3
    Затем встраивает S3 URL картины в аукцион, и возвращает обновлённый аукцион
    Так-же получает id аукциона из path

    Картинки хранятся n времени, которое прописано в AuctionsBucket.yml
*/

export const uploadAuctionPicture: APIGatewayProxyHandler = async (event: AWSLambda.APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const { id } = event.pathParameters;
    const { email } = event.requestContext.authorizer;
    const auction: Auction = await getAuctionById(id)

    if (auction.seller !== email) {
        throw new createError.Forbidden('You are not the seller of this auction!')
    }

    const base64: string = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer: Buffer = Buffer.from(base64, 'base64');

    let updatedAuction: Auction;

    try {
        // Загружаем картинку на S3, получаем её URL
        const pictureUrl: string = await uploadPictureToS3(auction.id + '.jpg', buffer)
        // URL картинки храним в аукционе
        updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl)
    } catch (error) {
        console.error(error)
        throw new createError.InternalServerError(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({
        inputSchema: uploadAuctionPictureSchema
    }))
    .use(cors())