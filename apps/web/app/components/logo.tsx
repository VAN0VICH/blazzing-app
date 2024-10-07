import { Link, useLocation } from "@remix-run/react";

type LogoProps = Omit<React.ComponentProps<typeof Link>, "href">;

function Logo({ className = "", ...props }: LogoProps) {
	const location = useLocation();
	const Nav =
		location.pathname === "/" || location.pathname === "/marketplace"
			? "div"
			: Link;
	return (
		//@ts-ignore
		<Nav
			className={`${className} block text-center  text-2xl font-extrabold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1`}
			unstable_viewTransition
			{...props}
		>
			<span className="text-balance font-freeman bg-black bg-gradient-to-b from-accent-9 to-accent-11 bg-clip-text text-4xl font-bold text-transparent lg:tracking-tight">
				Logo
			</span>
		</Nav>
	);
}

export { Logo };
