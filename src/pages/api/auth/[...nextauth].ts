import type { User } from "next-auth";
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider, { type DiscordProfile } from "next-auth/providers/discord";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import Credentials from "next-auth/providers/credentials";
import { env } from "../../../env/server.mjs";
import { compareUser, hashUser } from "../../../server/common/hasher";
import { prisma } from "../../../server/db/client";

const maxAge = 43_200;

export const authOptions: NextAuthOptions = {
	session: {
		// I'll be honest, no idea how to set it up with NextAuth's prisma adapter thingy 😭
		strategy: "jwt",
		maxAge,
		updateAge: maxAge - 60 * 30, // refresh 30 minutes before expiring
	},
	// Include user.id on session
	callbacks: {
		async session({ session, user, token }) {
			console.log(user);
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
			id: "creds",
			name: "Gotsu Account",
			type: "credentials",
			credentials: {
				username: { type: "string", placeholder: "xXNoobSlayer3000Xx" },
				password: { type: "password", placeholder: "Blues Eye White Dragon I choose you!" }
			},
			async authorize(credentials, req) {
				console.log(req);
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
				if (user.password) {
					const rightPassword = await compareUser(user.username, credentials.password, user.password);
					if (!rightPassword) {
						return null;
					}
				} else {
					await prisma.user.update({
						data: {
							password: (await hashUser(user.username, credentials.password)).hash
						},
						where: {
							id: user.id
						}
					});
				}

				return Object.assign({}, user, { name: user.username });
			},
		}),
		DiscordProvider({
			id: "discord",
			name: "Discord",
			authorization: `https://discordapp.com/oauth2/authorize?&client_id=${env.DISCORD_CLIENT_ID}&scope=identify+email+connections`,
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			async profile(profile:DiscordProfile):Promise<User> {
				if (profile.avatar === null) {
					const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
					profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
				} else {
					const format = profile.avatar.startsWith("a_") ? "gif" : "png";
					profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
				}
				const user = await prisma.user.findFirst({
					where: {
						email: profile.email,
					}
				});
				if (!user) {
					const newUser = await prisma.user.create({
						data: {
							username: profile.username,
							email: profile.email,
							image: profile.image_url,
						}
					});
					return Object.assign({}, newUser, { name: newUser.username });
				}
				if (!user.image) {
					await prisma.user.update({
						data: {
							image: profile.image_url,
						},
						where: {
							id: user.id,
						}
					});
				}
				return Object.assign({}, user, { name: user.username });
			},
		}),
		// ...add more providers here
	],
};

export default NextAuth(authOptions);
