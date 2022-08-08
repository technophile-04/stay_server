import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';
import { connectDatabase } from './database';

const PORT = process.env.PORT || 9000;

const mount = async (app: Application) => {
	const db = await connectDatabase();

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: () => ({
			db,
		}),
	});

	await server.start();

	server.applyMiddleware({ app, path: '/api' });

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
		console.log(`Graphql endpoint : http://localhost:${PORT}/api`);
	});
};

mount(express());
