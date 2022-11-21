import { router } from "../trpc";
import { authRouter } from "./auth";
import { boardsRouter } from "./boards";
import { usersRouter } from "./users";

export const appRouter = router({
  auth: authRouter,
	user: usersRouter,
	boards: boardsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
