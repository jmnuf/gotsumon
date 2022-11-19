import { router } from "../trpc";
import { authRouter } from "./auth";
import { usersRouter } from "./users";

export const appRouter = router({
  auth: authRouter,
	user: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
