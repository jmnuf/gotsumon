import { z } from "zod";
import { publicProcedure, router } from "../trpc";


export const boardsRouter = router({
	publicBoards: publicProcedure
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
					},
				},
				where: {
					privacy: "PUBLIC",
				},
				take: pageSize,
				skip: pageSize * page,
			});
			return { result: boards, count: boards.length, page, pageSize };
		}),
})
