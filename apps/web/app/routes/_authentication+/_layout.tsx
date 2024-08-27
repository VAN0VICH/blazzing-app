import { Box, Grid } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";

function SignIn() {
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
					className="h-full max-h-screen w-full object-cover dark:brightness-[0.7] dark:grayscale"
				/>
			</Box>
			<Outlet />
		</Grid>
	);
}
export default SignIn;
