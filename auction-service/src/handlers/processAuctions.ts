import createError from 'http-errors';
import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction'
import { Auction } from '../lib/types/IAuction';

/*
    Scheduled event, запускается раз в n времени (1 min), прописанном в serverless.yml
    Служит для закрытия аукционов, время которых подошло к концу
    Output: Количество закрытых аукционов
*/

const processAuctions = async () : Promise<{ closed: number }> => {
    try {
        const auctionsToClose: Auction[] = await getEndedAuctions()
        const closePromises = auctionsToClose.map(auction => closeAuction(auction))
        await Promise.all(closePromises);

        return { closed: closePromises.length };
    } catch (error) {
        console.error(error)
        throw new createError.InternalServerError(error)
    }
}

export const handler = processAuctions;