import { Context } from '../context'
import * as bcrpyt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { validateRegisterInput, validateLoginInput } from '../utils/validators'
import { checkAuth } from '../utils/auth-check'
import 'dotenv/config';
const { UserInputError } = require('apollo-server');



function generateToken(user) {
  const SECRET_KEY  = process.env.SECRET_KEY;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
}

export const usersResolvers = {
    Query: {
      allUsers: (_parent, _args, context: Context) => {

        const user = checkAuth(context);

        return context.prisma.user.findMany()
      },
      userById: (_parent, args: { id: number }, context: Context) => {

        const user = checkAuth(context);

        return context.prisma.user.findUnique({
          where: {
            id: args.id || undefined
          },
        })
      },
    },
    Mutation: {
      login: async (_parent, args: { email: string, password: string }, context: Context) => {


        const { email, password } = args;
        const { valid, errors } = validateLoginInput(email, password);
        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }
        const user = await context.prisma.user.findUnique({
          where: {
            email: email
          }
        })
        if (!user) {
          errors["general"] = 'User not found';
          throw new UserInputError('User not found', { errors });
        }
        const match = await bcrpyt.compare(password, user.password);
        if (!match) {
          errors["general"] = 'Wrong credentials';
          throw new UserInputError('Wrong credentials', { errors });
        }

        const token = generateToken(user);

        return {
          ...user,
          token,
        };
      },
      signupUser: async (
        _parent,
        args: { data: RegisterInput },
        context: Context,
      ) => {

        const { valid, errors } = validateRegisterInput(
          args.data.email,
          args.data.password,
          args.data.confirmPassword 
        );

        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }

        const user = await context.prisma.user.findUnique({ where: { email: args.data.email } });

        if (user) {
          throw new UserInputError('Email is taken', {
            errors: {
              email: 'This email is taken'
            }
          })
        }

        const password = await bcrpyt.hash(args.data.password, 12);

        const Saveduser = await context.prisma.user.create({
          data: {
            userName: args.data.userName || undefined,
            email: args.data.email,
            password: password,
          },
        })

        const token = generateToken(Saveduser);
        return {
          ...Saveduser,
          token,
        }

      },
      updatePassword: async (_parent, args: {email: string, currentpassword: string, newpassword: string }, context: Context) => {

        const { email, currentpassword, newpassword } = args;
        const { valid, errors } = validateLoginInput(email, currentpassword);
        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }
        //checking email are available or not
        const user = await context.prisma.user.findUnique({
          where: {
            email: email
          }
        })
        if(!user){
          throw new UserInputError("User Not Found")
        }

        const match = await bcrpyt.compare(currentpassword, user.password);
        if (!match) {
          errors["general"] = 'Wrong credentials';
          throw new UserInputError('Wrong credentials', { errors });
        }

        // Hashing password
        const haspassword = await bcrpyt.hash(newpassword, 12);
        const updated= await context.prisma.user.update({
          where: {email: email},
          data: {
            password: haspassword,
          },
        })
        return true
      }
    }

}

interface RegisterInput {
  userName: string
  password: string
  confirmPassword: string
  email: string
}
