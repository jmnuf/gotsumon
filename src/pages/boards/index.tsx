import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Body from "../../components/body";

const Boards: NextPage = () => {
	return (<>
		<Head>
			<title>G.Boards</title>
			<meta name="description" content="Check Gotsumon's Managed boards" />
		</Head>
		<Body>
			{/* Here goes navbar when done */}
			{/* Banner */}
			<UserBoards />
			{/* Boards Were user is a member but not owner */}
		</Body>
	</>);
};

export default Boards;


const UserBoards: React.FC = () => {

	const { data } = useSession();
	if (!data) {
		return (
			<div className="container flex flex-col justify-center items-center text-center">
				<p>Login to see your boards here!</p>
			</div>
		);
	}
	if (!data.user) {
		return <></>;
	}

	const boards = [
		{ "title": "Sample A", "link": "#" },
		{ "title": "Sample B", "link": "#" },
		{ "title": "Sample C", "link": "#" },
		{ "title": "Sample D", "link": "#" },
	];

	return (
		<div className="container flex flex-col p-2 justify-between items-center text-center">
			<h2 className="text-4xl">Your boards!</h2>
			<div className="w-full h-2 bg-slate-600 my-3 rounded-md"></div>
			<div className="container w-full grid md:grid-cols-2 grid-cols-1 gap-5">
				{
					boards.map((b, i) => <BoardCard key={i} content={b.title} href={b.link} />)
				}
			</div>
		</div>
	);
};

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

