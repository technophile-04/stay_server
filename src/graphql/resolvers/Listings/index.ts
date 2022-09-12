import { IResolvers } from '@graphql-tools/utils';
import { Listing } from '../../../lib/types';

export const listingsResolvers: IResolvers = {
	Listing: {
		id: (listing: Listing): string => listing._id.toString(),
	},
};
