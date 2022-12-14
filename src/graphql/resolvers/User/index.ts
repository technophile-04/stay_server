import { IResolvers } from '@graphql-tools/utils';
import { Request } from 'express';
import { Database, User } from '../../../lib/types';
import { authorize } from '../../../lib/utils';
import {
	UserArgs,
	UserBookingArgs,
	UserBookingData,
	UserListingArgs,
	UserListingData,
} from './types';

export const userResolver: IResolvers = {
	Query: {
		user: async (
			_root: undefined,
			{ id }: UserArgs,
			{ db, req }: { db: Database; req: Request }
		): Promise<User> => {
			try {
				const user = await db.users.findOne({ _id: id });

				if (!user) {
					throw new Error(`User can't be found !`);
				}

				const viewer = await authorize(db, req);

				if (viewer && viewer._id === user._id) {
					user.authorized = true;
				}

				return user;
			} catch (error) {
				throw new Error(`Failed to query User : ${error}`);
			}
		},
	},
	User: {
		id: (user: User) => {
			return user._id;
		},
		hasWallet: (user: User) => {
			return Boolean(user.walletId);
		},
		income: (user: User) => {
			return user.authorized ? user.income : null;
		},
		bookings: async (
			user: User,
			{ limit, page }: UserBookingArgs,
			{ db }: { db: Database }
		): Promise<UserBookingData | null> => {
			try {
				if (!user.authorized) {
					return null;
				}

				const data: UserBookingData = {
					total: 0,
					result: [],
				};

				let cursor = await db.bookings.find({
					_id: { $in: user.bookings },
				});

				cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
				cursor = cursor.limit(limit);

				data.total = await cursor.count();
				data.result = await cursor.toArray();

				return data;
			} catch (error) {
				throw new Error(`Failed to query user bookings ${error}`);
			}
		},
		listings: async (
			user: User,
			{ limit, page }: UserListingArgs,
			{ db }: { db: Database }
		): Promise<UserListingData | null> => {
			try {
				const data: UserListingData = {
					total: 0,
					result: [],
				};

				let cursor = await db.listings.find({
					_id: { $in: user.listings },
				});
				data.total = user.listings.length;

				cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
				cursor = cursor.limit(limit);

				data.result = await cursor.toArray();
				console.log('Listings', data);
				return data;
			} catch (error) {
				throw new Error(`Failed to query user listings ${error}`);
			}
		},
	},
};
