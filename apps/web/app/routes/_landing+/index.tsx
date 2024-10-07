// import { getAuth } from "@clerk/remix/ssr.server";
import { Icons } from "@blazzing-app/ui/icons";
import { Badge, Box, Flex } from "@radix-ui/themes";
import type { MetaFunction } from "@remix-run/cloudflare";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { Hero } from "~/components/landing/hero";
import Footer from "~/components/layout/footer";

// export const loader: LoaderFunction = async ({ context }) => {
// 	const { authUser } = context;
// 	if (authUser) return redirect("/marketplace");
// 	return json({});
// };
export const meta: MetaFunction = () => {
	return [
		{ title: "Blazell" },
		{ name: "description", content: "Welcome to Blazell!" },
	];
};
export default function Index() {
	return (
		<Flex direction="column" align="center">
			<div className="fixed -z-10 left-0 right-0 h-[550px] opacity-60 bg-gradient-to-b from-accent-5 to-transparent " />
			<Box
				style={{ animationDelay: "0.10s", animationFillMode: "both" }}
				className="bg-component text-gray-11 rounded-[5px] shadow px-2 hover:bg-gray-2 animate-fade-up text-sm font-medium flex justify-center items-center p-1 gap-2 h-8 absolute top-[10vh]"
			>
				<Badge>Beta</Badge>
				Under development.
				<Icons.Right className="size-4" />
			</Box>
			<Hero />
		</Flex>
	);
}
