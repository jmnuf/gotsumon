import type { User } from "next-auth";
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider, { type DiscordProfile } from "next-auth/providers/discord";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { User as DBUser } from "prisma/prisma-client";

import Credentials from "next-auth/providers/credentials";
import { env } from "../../../env/server.mjs";
import { compareUser, hashUser } from "../../../server/common/hasher";
import { prisma } from "../../../server/db/client";

const maxAge = 43_200;

export const authOptions: NextAuthOptions = {
	session: {
		maxAge,
		updateAge: maxAge - 60 * 30, // refresh 30 minutes before expiring
	},
	callbacks: {
		async session({ session, user, token }) {
			if (session.user) {
				if (token && !user) {
					session.user.name = token.name;
					session.user.image = token.picture;
					session.user.email = token.email;
					if (!token.name && !token.email) {
						return session;
					}
					user = await prisma.user.findFirst({
						select: {
							id: true,
							username: true,
							email: true,
							image: true,
						},
						where: {
							OR: {
								username: token.name as string,
								email: token.email as string,
							}
						}
					}) as User;
					if (user) {
						user.name = token.name
					} else {
						console.error("No user found!");
					}
				}
				if (user) {
					session.user.id = user.id;
					session.user.name = user.name ?? token.name ?? session.user.name ?? "Anon";
					session.user.image = user.image ?? session.user?.image ?? "";
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
			async authorize(credentials) {
				if (!credentials) {
					return null;
				}
				// My VSCode sometimes fakely says this lacks a type IDK man
				const user:DBUser|null = await prisma.user.findUnique({
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
			// allowDangerousEmailAccountLinking: true, // Technically a security issue but not sure how to setup connections properly too
			async profile(profile:DiscordProfile):Promise<User> {
				if (profile.avatar === null) {
					const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
					profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
				} else {
					const format = profile.avatar.startsWith("a_") ? "gif" : "png";
					profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
				}
				console.log("Calling profile method for DiscordProvider! Are we here before hitting page properly?")
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
					this.allowDangerousEmailAccountLinking = true;
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
