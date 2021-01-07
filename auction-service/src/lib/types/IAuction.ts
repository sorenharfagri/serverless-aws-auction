import { AuctionStatus } from './AuctionStatus.enum'

export interface Auction {
    createdAt: string
    endingAt: string
    seller: string
    id: string
    status: AuctionStatus
    title: string
    pictureUrl?: string
    highestBid: {
        amount: number
        bidder?: string
    }

}