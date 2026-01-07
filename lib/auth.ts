import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import Admin from './models/Admin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const admin = await Admin.findOne({ email: credentials.email });

                if (!admin) {
                    return null;
                }

                const isMatch = await bcrypt.compare(credentials.password, admin.password);

                if (!isMatch) {
                    return null;
                }

                return { id: admin._id.toString(), email: admin.email, name: 'Admin' };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    secret: process.env.NEXTAUTH_SECRET,
};
