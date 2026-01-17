import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        await connectToDatabase();
        const user = await User.findOne({ email });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
            id: String(user._id),
            email: user.email,
            username: user.username,
            };
      },
    }),
  ],
    callbacks: {
    async jwt({ token, user }) {
        if (user) {
        token.userId = (user as any).id;
        token.username = (user as any).username;
        }
        return token;
    },
    async session({ session, token }) {
        (session as any).userId = token.userId;
        (session.user as any).username = token.username;
        return session;
    },
    },

};
