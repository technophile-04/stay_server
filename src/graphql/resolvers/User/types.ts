import { Booking, Listing } from '../../../lib/types';

export interface UserArgs {
	id: string;
}

export interface UserBookingArgs {
	limit: number;
	page: number;
}

export interface UserBookingData {
	total: number;
	result: Booking[];
}

export interface UserListingArgs {
	limit: number;
	page: number;
}

export interface UserListingData {
	total: number;
	result: Listing[];
}
