import { useLocation } from "@remix-run/react";
import { Navbar } from "./navbar";

function Header() {
	const location = useLocation();
	const isRootPage = location.pathname === "/";

	if (isRootPage) return null;

	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />

			{/* Right corner */}
			<div className="gap-2 flex items-center " />
		</Navbar>
	);
}

export { Header };
