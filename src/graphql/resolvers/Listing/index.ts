import { IResolvers } from '@graphql-tools/utils';
import { Database, Listing } from '../../../lib/types';
import { ObjectId } from 'mongodb';

export const listingResolvers: IResolvers = {
	Query: {
		listings: async (
			_root: undefined,
			_args: Record<string, unknown>,
			{ db }: { db: Database }
		): Promise<Listing[]> => {
			return await db.listings.find({}).toArray();
		},
	},
	Mutation: {
		deleteListing: async (
			_root: undefined,
			{ id }: { id: string },
			{ db }: { db: Database }
		): Promise<Listing> => {
			const deletedResult = await db.listings.findOneAndDelete({
				_id: new ObjectId(id),
			});

			if (!deletedResult.value) {
				throw new Error('Failed to delete listing');
			}

			return deletedResult.value;
		},
	},
	Listing: {
		// Explicitly define the type of the id field
		id: (listing: Listing): string => listing._id.toString(),
	},
};
