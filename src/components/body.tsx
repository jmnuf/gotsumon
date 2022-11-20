import React from "react";
import Navbar from "./navbar";


export default function Body({ children, className, activePage }:React.PropsWithChildren&{ className?:string, activePage:number }) {
	return (
		<div className="absolute left-0 right-0 min-h-screen bg-gradient-to-b from-[#160036] to-[#000228] text-stone-300">
			<Navbar activePage={activePage} />
			<main className={"flex h-full mt-12 pt-3 flex-col items-center justify-center" + (className? ` ${className}` : "")}>
				{children}
			</main>
		</div>
	)
}
