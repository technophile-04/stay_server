import merge from 'lodash.merge';
import { viewerResolver } from './Viewer';
import { userResolver } from './User';
import { listingsResolvers } from './Listings';
import { bookingsResolver } from './Bookings';
export const resolvers = merge(
	listingsResolvers,
	bookingsResolver,
	userResolver,
	viewerResolver
);
