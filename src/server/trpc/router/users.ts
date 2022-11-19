import { z } from "zod";
import { publicProcedure, router } from "../trpc";


export const usersRouter = router({
	getUserFromUsername: publicProcedure
		.input(z.object({
			username: z.string()
		}))
		.query(async ({ input, ctx }) => {
			const user = await ctx.prisma.user.findUnique({
				where: {
					username: input.username
				}
			});
			if (!user) {
				return { user: null, message: "User with given username not found", code: 404 };
			}
			const userData = {
				id: user.id,
				username: user.username,
				name: user.name,
				image: user.image,
				email: user.email,
				createdAt: user.createdAt,
			};
			return { user: userData, message: "User found", code: 201 }
		})
})
