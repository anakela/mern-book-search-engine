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
        login: async (parent, { email, password }, context) => {
            const user = await User.create({ email, password });
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, { username, email, password }, context) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
            if (context.user) {
                const userData = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    {
                        $addToSet: {
                            savedBooks: {
                                authors,
                                description,
                                title,
                                bookId,
                                image,
                                link,
                            }
                        }
                    }
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