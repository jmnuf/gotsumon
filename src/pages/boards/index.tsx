import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Body from "../../components/body";
import { PageIndex } from "../../components/navbar";
import Spinner from "../../components/spinner";
import { trpc } from "../../utils/trpc";

type BoardsDataList = {
	id: string,
	name: string,
	owner: {
		name:string|null,
		username:string,
	}
}[]

const Boards: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ boards }) => {
	const session = useSession();

	console.log(boards);

	return (<>
		<Head>
			<title>G.Boards</title>
			<meta name="description" content="Check Gotsumon's Managed boards" />
		</Head>
		<Body activePage={PageIndex.Boards}>
			{/* Banner */}
			<UserBoards sessionData={session.data} />
			{/* Boards Were user is a member but not owner */}
			<BoardsGrid title="Public Boards" loading={false} boards={boards} />
		</Body>
	</>);
};

export default Boards;

export const getServerSideProps:GetServerSideProps<{ boards:BoardsDataList }> = async () => {
	const props = { boards: [] } as { boards:BoardsDataList };
	if (prisma) {
		const publicBoards = await prisma.activityLogger.findMany({
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
			}
		});
		props.boards = publicBoards;
	}
	return { props }
}


const UserBoards: React.FC<{ sessionData:Session|null }> = ({ sessionData }) => {

	if (!sessionData) {
		return (
			<div className="container flex flex-col justify-center items-center text-center">
				<p>Login to see your boards here!</p>
			</div>
		);
	}
	if (!sessionData.user) {
		return (
			<BoardsGrid title="Your boards" loading={false} boards={[]} emptyFallback="Can't reach your account currently? Idk what's happening, maybe log out and log in again if refreshing don't work?" />
		);
	}

	const emptyFallback = sessionData.user ? "You currently have no boards :o" : "Can't reach your account currently? Idk what's happening, maybe log out and log in again if refreshing don't work?";

	const { data, isLoading } = trpc.auth.getBoards.useQuery();

	const boards:BoardsDataList|undefined = data ? data.result : []

	return (
		<BoardsGrid title="Your boards" loading={isLoading} boards={boards} emptyFallback={emptyFallback} />
	);
};

type BoardsGridProps = {
	title:string,
	loading?:boolean,
	boards:BoardsDataList,
	emptyFallback?:string|JSX.Element,
};

const BoardsGrid: React.FC<BoardsGridProps> = ({ title, loading, boards, emptyFallback }) => {
	const gridCSS = !loading && boards.length > 0 ? "grid md:grid-cols-2 grid-cols-1 gap-5" : "flex flex-row text-center justify-center items-center";
	return (
		<div className="container flex flex-col p-2 justify-between items-center text-center">
			<h2 className="text-4xl">{title}</h2>
			<div className="w-full h-1 bg-slate-600 mt-1 mb-3 rounded-full"></div>
			<div className={`container md:w-full w-4/5 ${gridCSS}`}>
				{
					!loading ? (
						boards.length > 0 ?
						boards.map(b => <BoardCard key={b.id} content={b.name} href={`/b/${b.id}`} />) :
						emptyFallback ?? "List of boards is empty"
					) : (
						<Spinner />
					)
				}
			</div>
		</div>
	)
}

const BoardCard: React.FC<{ content: string, href: string; }> = ({ content, href }) => {
	return (
		<Link
			href={href}
		>
			<div className="flex flex-row relative text-center items-center py-4 h-32 bg-opacity-50 hover:bg-opacity-100 bg-slate-300 text-white hover:text-violet-900 rounded-lg shadow-inner hover:shadow-2xl transition-all duration-200 hover:scale-105 hover:outline outline-2 outline-purple-600">
				<h2 className="text-2xl text-center w-full select-none">{content}</h2>
			</div>
		</Link>
	);
}

