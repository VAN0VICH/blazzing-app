import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Spinner,
	Text,
} from "@radix-ui/themes";
import { Link, useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { useIsPending } from "~/hooks/use-is-pending";
const Login = () => {
	const isPending = useIsPending();
	const fetcher = useFetcher();
	const onGoogleClick = useCallback(() => {
		return fetcher.submit(
			{},
			{
				method: "POST",
				action: "/google/login",
			},
		);
	}, [fetcher.submit]);

	const onTestUserClick = useCallback(() => {
		return fetcher.submit(
			{},
			{
				method: "POST",
				action: "/action/create-test-user",
			},
		);
	}, [fetcher.submit]);

	const isGoogleSubmitting = fetcher.state === "submitting";

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
			<Flex
				height="100vh"
				justify="center"
				align={{ initial: "start", md: "center" }}
				pt={{ initial: "9", md: "0" }}
			>
				<Grid gap="4">
					<Heading size="8" align="center" className="font-freeman pb-4">
						Sign in to{" "}
						<span className="text-balance bg-gradient-to-b from-accent-9 to-accent-11 bg-clip-text font-bold text-transparent lg:tracking-tight ">
							Blazzing App
						</span>
					</Heading>

					<Flex direction="column" justify="center" gap="4" align="center">
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Button
								type="button"
								variant="outline"
								size="3"
								className="w-full"
								onClick={onTestUserClick}
								disabled={isPending || isGoogleSubmitting}
							>
								{(isPending || isGoogleSubmitting) && <Spinner />}
								Demo user
							</Button>
						</Box>
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Button
								type="button"
								variant="surface"
								size="3"
								className="w-full"
								onClick={onGoogleClick}
								disabled={isPending || isGoogleSubmitting}
							>
								{(isPending || isGoogleSubmitting) && <Spinner />}
								Google
							</Button>
						</Box>
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Text align="center" color="gray" className="w-full" size="2">
								By signing in, you agree to our{" "}
								<Link
									to="/terms"
									className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									to="/privacy"
									className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									Privacy Policy
								</Link>
								.
							</Text>
						</Box>
					</Flex>
				</Grid>
			</Flex>
		</Grid>
	);
};
export default Login;
