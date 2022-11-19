import NextAuth, { type NextAuthOptions } from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// import { env } from "../../../env/server.mjs";
import Credentials from "next-auth/providers/credentials";
import { compareUser } from "../../../server/common/hasher";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 43_200,
		updateAge: 21_600,
	},
  // Include user.id on session
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
				if (token) {
					session.user.name = token.name;
					session.user.image = token.picture;
				}
				if (user) {
					session.user.id = user.id;
					session.user.name = user.name ?? session.user.name;
					session.user.image = user.image ?? session.user.image;
				}
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
		Credentials({
			type: "credentials",
			credentials: {
				username: { type: "string" },
				password: { type: "password" }
			},
			async authorize(credentials, req) {
				console.log(req.headers);
				if (!credentials) {
					return null;
				}
				const user = await prisma.user.findUnique({
					where: {
						username: credentials.username,
					}
				});
				if (!user) {
					return null;
				}
				const rightPassword = await compareUser(user.username, credentials.password, user.password);
				if (!rightPassword) {
					return null;
				}

				return Object.assign({}, user, { name: user.username });
			},
		})
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
