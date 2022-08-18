import { Collection, ObjectId } from 'mongodb';

interface BookingsIndexMonth {
	[key: string]: boolean;
}

interface BookingsIndexYear {
	[key: string]: BookingsIndexMonth;
}

interface BookingsIndex {
	[key: string]: BookingsIndexYear;
}

export enum ListingType {
	Apartment = 'APARTMENT',
	House = 'HOUSE',
}
export interface Listing {
	_id: ObjectId;
	// listing title
	title: string;
	// listing description
	description: string;
	// image of listing
	image: string;
	// host : string will be referencing User model unique id
	host: string;
	// listing type if its apartment or house
	type: ListingType;
	// listing address
	address: string;
	// listing country
	country: string;
	// used for geocoding the location
	admin: string;
	// listing city
	city: string;
	// booking related to listing
	bookings: ObjectId[];
	// to keep track of dates
	bookingsIndex: BookingsIndex;
	// price per day set by host
	price: number;
	// max to number of guest
	numOfGuests: number;
}

export interface User {
	// _id : string type because will be third party lib
	_id: string;
	// to store users login session
	token: string;
	// users human readable name
	name: string;
	// users avatar image
	avatar: string;
	// email address
	contact: string;
	// identifying filed to store users payment details
	walletId?: string;
	// users total income
	income: number;
	// users bookings
	bookings: ObjectId[];
	// users listed rooms
	listings: ObjectId[];
	// to check if user is authorized(not stored in db)
	authorized?: boolean;
}

export interface Booking {
	_id: ObjectId;
	// To which listing it belongs
	listing: ObjectId;
	// referred to user
	tenant: string;
	// booking checkIN
	checkIn: string;
	// booking checkout
	checkOut: string;
}

export interface Database {
	listings: Collection<Listing>; // array of listings
	users: Collection<User>;
	bookings: Collection<Booking>;
}

export interface Viewer {
	_id?: string;
	token?: string;
	avatar?: string;
	walletId?: string;
	didRequest: boolean;
}
