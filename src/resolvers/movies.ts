import { Context } from '../context'
import { checkAuth } from '../utils/auth-check'
const { UserInputError } = require('apollo-server');

export const moviesResolvers = {
    Query: {
      allMovies: (_parent, args: {sortOrder: SortOrder, pagination: number}, context: Context) => {

        const user = checkAuth(context);
        return context.prisma.movie.findMany({
          take: args.pagination,
          orderBy: {
           releaseDate: args.sortOrder
          },
        })

      },
      movieById: (_parent, args: { id: number }, context: Context) => {

        const user = checkAuth(context);
        return context.prisma.movie.findUnique({
          where: {
            id: args.id || undefined
          },
        })
      }

    },
    
    Mutation: {
      createMovie: (
        _parent,
        args: { movieName: string,  description: string,  directorName: string,  releaseDate: Date },
        context: Context,
      ) => {

        if (args.movieName.trim() === '') {
            throw new UserInputError('Movie name cannot be empty')
        }

        const user = checkAuth(context);

        return context.prisma.movie.create({
          data: {
            movieName: args.movieName,
            description: args.description,
            directorName: args.directorName,
            releaseDate: args.releaseDate
          },
        })

      },

      deleteMovie: async (_parent, args: { id: number }, context: Context) => {

        const user = checkAuth(context);

        // fetching movie by id
        const movie = await context.prisma.movie.findUnique({
            where: { id: args.id || undefined },
        })

        // Checking if movie exists
        if (!movie) {
            throw new UserInputError('Movie not found')
        }

        if( !user ){
          throw new UserInputError("user not authenticated")
        }

        // Deleting movie
        return context.prisma.movie.delete({
          where: { id: args.id },
        })
      },
      updateMovie: async (_parent, args: { data: MovieUpdateInput }, context: Context) => {

        const user = checkAuth(context);

        if( !user){
          throw new UserInputError("user not authenticated")
        }

        const movie = await context.prisma.movie.findUnique({
            where: { id: args.data.id || undefined },
        })

        if (!movie) {
            throw new UserInputError('Post not found')
        }

        // Updating movie name
        return context.prisma.movie.update({
          where: { id: args.data.id },
          data: {
            movieName: args.data.movieName,
          },
        })
      }
    }
}
  
  enum SortOrder {
    asc = 'asc',
    desc = 'desc',
  }

  interface MovieUpdateInput {
    id: number
    movieName: string
  }
