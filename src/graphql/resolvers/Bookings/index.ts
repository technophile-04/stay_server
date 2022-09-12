import { IResolvers } from '@graphql-tools/utils';
import { Booking, Database, Listing } from '../../../lib/types';

export const bookingsResolver: IResolvers = {
	Booking: {
		id: (booking: Booking): string => booking._id.toString(),
		listing: (
			booking: Booking,
			_args,
			{ db }: { db: Database }
		): Promise<Listing | null> => {
			return db.listings.findOne({ _id: booking.listing });
		},
	},
};
