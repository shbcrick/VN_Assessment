import {moviesResolvers} from './movies';
import {usersResolvers} from './users';
import 'dotenv/config';


import { DateTimeResolver } from 'graphql-scalars'

export const resolvers = {
 
  Query: {
    ...moviesResolvers.Query,
    ...usersResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...moviesResolvers.Mutation,
  },
  DateTime: DateTimeResolver,
};