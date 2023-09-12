export const typeDefs = `#graphql

  type Mutation {
    signupUser(data: RegisterInput): User!
    login(email: String!, password: String!): User!
    deleteMovie(id: Int!): Movie
    updateMovie(data: MovieUpdateInput! ): Movie
    createMovie(movieName: String!,  description: String!,  directorName: String!,  releaseDate: DateTime ): Movie
    updatePassword(email: String!, currentpassword: String!, newpassword: String! ): Boolean
  }


  type Movie {
    id: Int!
    movieName: String!
    description: String!
    directorName: String!
    releaseDate: DateTime
  }

  input MovieUpdateInput {
    id: Int!
    movieName: String!
  }

  type Query {
    allUsers: [User!]!
    userById(id: Int!): User
    allMovies(sortOrder: SortOrder, pagination: Int): [Movie!]!
    movieById(id: Int!): Movie
  }


  type User {
    email: String!
    id: Int!
    token: String!
    userName: String
  }

  enum SortOrder {
    asc
    desc
  }

  input RegisterInput {
    userName: String
    password: String!
    confirmPassword: String!
    email: String!
  }

  scalar DateTime
`
