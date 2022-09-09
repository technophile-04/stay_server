import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';
import { connectDatabase } from './database';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 9000;

const mount = async (app: Application) => {
	const db = await connectDatabase();

	app.use(cookieParser(process.env.SECRET));
	const corsOption = { credentials: true, origin: 'http://localhost:3000' };

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => ({
			db,
			req,
			res,
		}),
	});

	await server.start();

	server.applyMiddleware({ app, path: '/api', cors: corsOption });

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
		console.log(`Graphql endpoint : http://localhost:${PORT}/api`);
	});
};

mount(express());
