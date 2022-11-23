import { z } from "zod";
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
	getBoards: protectedProcedure
	.input(z.object({
		page: z.number().int().default(0),
		pageSize: z.number().int().default(10),
	}).default({}))
	.query(async ({ ctx, input: { page, pageSize } }) => {
		const boards = await ctx.prisma.activityLogger.findMany({
			select: {
				id: true,
				name: true,
				owner: {
					select: {
						name: true,
						username: true,
					}
				}
			},
			where: {
				ownerId: ctx.session.user.id
			},
			take: pageSize,
			skip: pageSize * page,
		});
		return { result: boards, count: boards.length, page, pageSize }
	}),
	getBoardContents: protectedProcedure
	.input(z.object({
		board: z.string(),
	}))
	.query(async ({ ctx, input }) => {
		const board = await ctx.prisma.activityLogger.findUnique({
			select: {
				id: true,
				name: true,
				owner: {
					select: {
						name: true,
						username: true,
						image: true,
					}
				},
				ActivityLoggerMembers: {
					select: {
						member: {
							select: {
								name: true,
								username: true,
								image: true,
							}
						}
					}
				}
			},
			where: {
				id: input.board
			}
		});
		const cards = await ctx.prisma.activityCard.findMany({
			select: {
				id: true,
				title: true,
				contents: {
					select: {
						id: true,
						content: true,
					}
				},
				owner: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
					}
				},
				createdAt: true,
				resolvedAt: true,
			},
			where: {
				activityLoggerId: input.board
			}
		});

		return {
			result: board ? { board, cards } : null,
			code: board ? 200 : 404,
		}
	})
});
