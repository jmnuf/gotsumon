import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.prisma.user.findUnique({
			select: {
				name: true,
				username: true,
				image: true,
			},
			where: {
				id: ctx.session.user.id
			}
		});
		if (!user) {
			throw new Error("Invalid connection. User not found");
		}
		const hasImage = user.image != null && user.image.length !== 0;
		let url = "https://i.picsum.photos/id/579/3200/3200.jpg?hmac=xWcEOXrHnInhKGDE_W5oxKFA5BDyeTi4HvX9WlCEWxw";
		if (user && user.image) {
			url = user.image;
		}
		return { url, hasImage, name: user.name, username: user.username };
	}),
});
