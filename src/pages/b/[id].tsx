import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Image from 'next/image';
import React from "react";
import Body from '../../components/body';
import { PageIndex } from '../../components/navbar';
import { createContextInner } from '../../server/trpc/context';
import { authRouter } from '../../server/trpc/router/auth';


const Board: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
	const session = useSession();
	// const [page, setPage] = useState(0);
	//
	// const { data:query, isLoading } = trpc.auth.getBoards.useQuery({ page });

	if (props.board == null) {
		return (
			<>
				<Head>
					<title>Gotsu|Unknown board</title>
					<meta name="description" content="Failed to find the requested board" />
				</Head>
				<Body activePage={PageIndex.Boards}>
					<div className="flex flex-row justify-center align-center text-center h-full w-full">
						<h2 className="text-3xl">Failed to fetch board</h2>
						<p>If you are sure this board exists this might be a server error and you can try to refresh the page</p>
					</div>
				</Body>
			</>
		);
	}

	const board = props.board;
	const { cards, members } = props.board;

	return (
		<>
			<Head>
				<title>{board.name}</title>
				<meta name="description" content={session.status != "authenticated" ? "Check Gotsumon's Managed boards" : "Check your Gotsu-boards"} />
			</Head>
			<Body activePage={PageIndex.Boards}>
				<div className="flex flex-row justify-between w-full min-h-fit">
					<div className="flex flex-row">
						{
							members.map(m => {
								return (
									<div key={m.username} className="flex flex-row-reverse justify-center align-middle text-left bg-slate-400 text-slate-900">
										<h3>{m.name ? m.name : m.username}<br />{`@${m.username}`}</h3>
										<Image
											src={m.image ?? "https://i.picsum.photos/id/579/3200/3200.jpg?hmac=xWcEOXrHnInhKGDE_W5oxKFA5BDyeTi4HvX9WlCEWxw"}
											width={64}
											height={64}
											className="rounded-full border-4 [border-style:inset]"
											alt="User profile image"
										/>
									</div>
								);
							})
						}
					</div>
					<div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 container mx-auto">
						<CardsList title="Unresolved" cards={cards.filter(c => c.resolvedAt == null)} />
						<CardsList title="Resolved" cards={cards.filter(c => c.resolvedAt != null)} />
					</div>
				</div>
			</Body>
		</>
	);
};

const CardsList: React.FC<{ title: string, cards: Card[]; }> = ({ title, cards }) => {
	return (
		<div className="flex flex-col gap-6 outline outline-2 outline-slate-500 rounded-md">
			<h2 className="text-4xl underline text-center select-none">{title}</h2>
			<div className="flex flex-col lg:gap-6 gap-4">
				{
					cards.map(c => {
						const createdAt = new Date(c.createdAt);
						const resolvedAt = c.resolvedAt ? new Date(c.resolvedAt) : null;
						return (
							<div key={c.id} className="flex flex-row h-24 bg-slate-200 text-gray-800 outline outline-2 outline-amber-100">
								<h3 className="text-3xl">{c.title}</h3>
								<span className="text-gray-500 select-none">{createdAt.toLocaleDateString()}{resolvedAt ? ` - ${resolvedAt.toLocaleDateString()}` : undefined}</span>
							</div>
						);
					})
				}
			</div>
		</div>
	);
};

type Person = {
	name: string | null,
	username: string,
	image: string | null,
};
type Card = {
	id: string,
	title: string,
	owner: Person,
	contents: { id: string, content: string; }[],
	createdAt: string,
	resolvedAt: string | null;
};

type ServerProps = {
	board: null,
	message: "Failed";
} | {
	board: {
		id: string;
		name: string;
		owner: Person;
		members: Person[],
		cards: Card[];
	},
	message: "Fetched";
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (ctx) => {
	const session = await getSession(ctx);
	const ssg = createProxySSGHelpers({
		router: authRouter,
		ctx: await createContextInner({ session }),
	});

	if (!ctx.params || typeof ctx.params.id !== "string") {
		return { props: { board: null, message: "Failed" } };
	}


	const q = await ssg.getBoardContents.fetch({ board: ctx.params.id });

	const props: ServerProps = q.result ? {
		message: "Fetched",
		board: {
			id: q.result.board.id,
			name: q.result.board.name,
			owner: q.result.board.owner,
			members: q.result.board.ActivityLoggerMembers.map(({ member: m }) => ({ name: m.name, username: m.username, image: m.image })),

			cards: q.result.cards.map(c => ({ ...c, createdAt: c.createdAt.toJSON(), resolvedAt: c.resolvedAt? c.resolvedAt.toJSON() : null }))
		}
	} : { message: "Failed", board: null };

	console.log(props.message);

	return { props };
};

export default Board;
