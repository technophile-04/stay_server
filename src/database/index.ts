import { MongoClient } from 'mongodb';
import { Database } from '../lib/types';

const user = process.env.DB_USER;
const password = process.env.DB_USER_PASSWORD;
const cluster = process.env.DB_CLUSTER;

const uri = `mongodb://${user}:${password}@${cluster}.reta2.mongodb.net:27017,cluster0-shard-00-01.reta2.mongodb.net:27017,cluster0-shard-00-02.reta2.mongodb.net:27017/?ssl=true&replicaSet=atlas-10j5vi-shard-0&authSource=admin&retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
	const client = await MongoClient.connect(uri);
	const db = client.db('theRentD');

	return {
		listings: db.collection('test_listings'),
	};
};
