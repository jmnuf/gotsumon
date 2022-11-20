import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
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
			{/* Banner + Public boards */}
			<UserBoards />
		</Body>
	</>);
};

export default Boards;


const UserBoards: React.FC = () => {

	const { data } = useSession();
	if (!data) {
		return <></>;
	}
	if (!data.user) {
		return <></>;
	}

	return (
		<div className="container flex flex-col p-2 justify-between items-center text-center">
			<h2 className="text-4xl">Your boards!</h2>
			<div className="w-full h-2 bg-slate-600 my-3 rounded-md"></div>
			<div className="container w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
				<div>
					Sample Board Item AA
				</div>
				<div>
					Sample Board Item AB
				</div>
				<div>
					Sample Board Item AC
				</div>
				<div>
					Sample Board Item AD
				</div>
				<div>
					Sample Board Item BA
				</div>
				<div>
					Sample Board Item BB
				</div>
				<div>
					Sample Board Item BC
				</div>
				<div>
					Sample Board Item BD
				</div>
			</div>
		</div>
	);
}

