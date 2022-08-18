import merge from 'lodash.merge';
import { viewerResolver } from './Viewer';
import { userResolver } from './User';
export const resolvers = merge(userResolver, viewerResolver);
