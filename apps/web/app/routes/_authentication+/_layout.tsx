import { getAuth } from "@clerk/remix/ssr.server";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { type LoaderFunction, redirect } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = async (args) => {
	// Use getAuth() to retrieve the user's ID
	const { userId } = await getAuth(args);

	// If there is no userId, then redirect to sign-in route
	if (userId) {
		return redirect("/dashboard/store");
	}

	// Return the retrieved user data
	return Response.json({});
};
export default function AuthLayout() {
	return (
		<Grid
			width={"100%"}
			columns={{ initial: "1", md: "2" }}
			p={{ initial: "3", md: "0" }}
		>
			<Box display={{ initial: "none", md: "block" }}>
				<img
					src="https://cdn.midjourney.com/845a8afa-1b61-478c-aff5-013bb5bb3d89/0_0.jpeg"
					alt="Onboarding"
					className="h-full max-h-screen w-full object-cover brightness-[0.7] grayscale"
				/>
			</Box>
			<Flex
				height="100vh"
				justify="center"
				align={{ initial: "start", md: "center" }}
				pt={{ initial: "9", md: "0" }}
			>
				<Outlet />
			</Flex>
		</Grid>
	);
}
