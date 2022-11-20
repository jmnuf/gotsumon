import React from "react";


export default function Body({ children, className }:React.PropsWithChildren&{ className?:string }) {
	return (
		<main className={"flex min-h-screen flex-col items-center justify-center text-stone-300 bg-gradient-to-b from-[#160036] to-[#000228]" + (className? ` ${className}` : "")}>
			{children}
		</main>
	)
}
