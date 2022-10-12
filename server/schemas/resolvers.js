const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in.');
        }
    },

    Mutation: {
        login: async (parent, { username, email, password }, context) => {
            const user = await User.findOne({$or: [{ username }, { email }]});
            if (!user){
                throw new AuthenticationError('No user found.');
            }
            const correctPassword = await user.isCorrectPassword(password);
            if (!correctPassword) {
                throw new AuthenticationError('Incorrect login credentials.');
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, { username, email, password }, context) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { book }, context) => {
            if (context.user) {
                const userData = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    {
                        $addToSet: {
                            savedBooks: { savedBooks: { ...book }}
                        },
                    },
                    // { new: true, runValidators: true},
                )
                return userData;
            }
            throw new AuthenticationError('You need to be logged in.');
        },
        removeBook: async(parent, { bookId }, context) => {
            if (context.user) {
                const userData = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } }
                );

                return userData;
            }
            throw new AuthenticationError('You need to be logged in.');
        }
    }
};

module.exports = resolvers;