import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { trpc } from "../utils/trpc";

const defaultPFP = "https://i.picsum.photos/id/579/3200/3200.jpg?hmac=xWcEOXrHnInhKGDE_W5oxKFA5BDyeTi4HvX9WlCEWxw";

export const PageIndex = Object.freeze({
	Home: 0,
	Boards: 1,
});

const pages:[string, string][] = [
	["/", "Home"],
	["/boards", "Boards"]
]

const Navbar: React.FC<{ activePage:number }> = ({ activePage }) => {

	const { data: query } = trpc.auth.getProfile.useQuery(undefined, { enabled: false });

	return (
		<nav className="fixed w-full px-2 sm:px-4 py-2 min-h-[50px] h-auto opacity-75 duration-200 hover:opacity-100 transition-all bg-slate-600 z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
			<div className="container flex flex-wrap items-center justify-between mx-auto h-9">
				<Link href={"/"} className="flex items-center">
					<Image src="https://flowbite.com/docs/images/logo.svg" width={24} height={24} className="h-6 mr-3 sm:h-9" alt="Gotsu placeholder for Logo" />
					<span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Gotsu</span>
				</Link>
				<div className="relative flex items-center md:order-2">
					<button type="button" className="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
						<span className="sr-only">Open user menu</span>
						{
							query ? (
								<Image width={32} height={32} className="w-8 h-8 rounded-full border-4 [border-style:inset]" src={query.url} alt="user photo" />
							) : (
								<Image width={32} height={32} className="w-8 h-8 rounded-full" src={defaultPFP} alt="user placeholder photo" />
							)
						}
					</button>
					{
						query ? <UserDropdownMenu name={query.name ?? query.username} username={query.username} /> : undefined
					}
					<button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
						<span className="sr-only">Open main menu</span>
						<svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
					</button>
				</div>
				<div className="relative items-center h-9 justify-between hidden w-full md:flex md:w-auto md:order-1" id="mobile-menu-2">
					<ul className="flex flex-col p-4 mt-4 border rounded-lg md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
						<NavItemsList active={activePage} />
					</ul>
				</div>
			</div>
		</nav>
	);
};

const UserDropdownMenu: React.FC<{ name:string, username:string }> = ({ name, username }) => {
	const css = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white";
	return (
		<div className="absolute hidden z-50 top-4 right-0 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown">
			<div className="px-4 py-3">
				<span className="block text-sm text-gray-900 dark:text-white">{name}</span>
				<span className="block text-sm font-medium text-gray-500 truncate dark:text-gray-400">{username}</span>
			</div>
			<ul className="py-1" aria-labelledby="user-menu-button">
				<li>
					<Link href="/boards" className={css}>Dashboard</Link>
				</li>
				<li>
					<a href="#" className={css}>Settings</a>
				</li>
				<li>
					<a href="#" className={css}>Earnings</a>
				</li>
				<li>
					<button className={css} onClick={() => signOut()}>Sign out</button>
				</li>
			</ul>
		</div>
	);
};

const NavItemsList:React.FC<{ active:number }> = ({ active }) => {
	return (
		<>
			{
				pages.map((item, index) => {
					if (index == active) {
						return <Link key={item[0]} href={item[0]} className="block py-2 pl-3 pr-4 rounded text-blue-500 hover:text-blue-300" aria-current="page">{item[1]}</Link>
					}
					return <Link key={item[0]} href={item[0]} className="block py-2 pl-3 pr-4 rounded text-zinc-500 hover:text-white">{item[1]}</Link>
				})
			}
		</>
	)
}

export default Navbar;
