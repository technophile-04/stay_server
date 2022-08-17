import { IResolvers } from '@graphql-tools/utils';
import { Google } from '../../../lib/api';
import { Database, User, Viewer } from '../../../lib/types';
import { LogInArgs } from './types';
import crypto from 'crypto';
import { Request, Response } from 'express';

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	signed: true,
	sameSite: true,
};

const loginViaGoogle = async (
	code: string,
	token: string,
	db: Database,
	res: Response
): Promise<User | null> => {
	const { user } = await Google.login(code);
	if (!user) {
		throw new Error('Google login error');
	}

	const userNamesList = user.names && user.names.length ? user.names : null;
	const userPhotoList = user.photos && user.photos.length ? user.photos : null;
	const userEmailList =
		user.emailAddresses && user.emailAddresses.length
			? user.emailAddresses
			: null;

	const userName = userNamesList ? userNamesList[0].displayName : null;
	const userAvatar = userPhotoList ? userPhotoList[0].url : null;
	const userId =
		userNamesList &&
		userNamesList[0].metadata &&
		userNamesList[0].metadata.source
			? userNamesList[0].metadata.source.id
			: null;

	const userEmail = userEmailList ? userEmailList[0].value : null;

	if (!userId || !userEmail || !userName || !userAvatar) {
		throw new Error('Google login error');
	}

	const updateRes = await db.users.findOneAndUpdate(
		{ _id: userId },
		{
			$set: {
				name: userName,
				avatar: userAvatar,
				token: token,
				contact: userEmail,
			},
		},
		{
			returnDocument: 'after',
		}
	);
	let viewer = updateRes.value;

	if (!viewer) {
		await db.users.insertOne({
			_id: userId,
			token,
			name: userName,
			avatar: userAvatar,
			contact: userEmail,
			income: 0,
			bookings: [],
			listings: [],
		});

		viewer = {
			_id: userId,
			token,
			name: userName,
			avatar: userAvatar,
			contact: userEmail,
			income: 0,
			bookings: [],
			listings: [],
		};
	}

	res.cookie('viewer', userId, {
		...cookieOptions,
		maxAge: 365 * 24 * 60 * 60 * 1000,
	});

	return viewer;
};

const loginViaCookie = async (
	token: string,
	db: Database,
	req: Request,
	res: Response
): Promise<User | null> => {
	const updateRes = await db.users.findOneAndUpdate(
		{ _id: req.signedCookies.viewer },
		{
			$set: {
				token,
			},
		},
		{
			returnDocument: 'after',
		}
	);

	const viewer = updateRes.value;

	if (!viewer) {
		res.clearCookie('viewer', cookieOptions);
	}

	return viewer;
};

export const viewerResolver: IResolvers = {
	Query: {
		authUrl: () => {
			try {
				return Google.authUrl;
			} catch (error) {
				throw new Error(`Failed to query Google auth URL : ${error}`);
			}
		},
	},
	Mutation: {
		logIn: async (
			_root: undefined,
			{ input }: LogInArgs,
			{ db, res, req }: { db: Database; res: Response; req: Request }
		): Promise<Viewer> => {
			try {
				const code = input ? input.code : null;
				const token = crypto.randomBytes(16).toString('hex');

				const viewer: User | null = code
					? await loginViaGoogle(code, token, db, res)
					: await loginViaCookie(token, db, req, res);

				if (!viewer) {
					return { didRequest: true };
				}

				return {
					_id: viewer._id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error(`Failed to log in : ${error}`);
			}
		},
		logOut: (
			_root: undefined,
			_args: Record<string, never>,
			{ res }: { res: Response }
		): Viewer => {
			try {
				res.clearCookie('viewer', cookieOptions);
				return { didRequest: true };
			} catch (error) {
				throw new Error(`Failed to log out : ${error}`);
			}
		},
	},
	Viewer: {
		id: (viewer: Viewer): string | undefined => viewer._id,
		hasWallet: (viewer: Viewer): boolean | undefined => {
			return viewer.walletId ? true : undefined;
		},
	},
};
