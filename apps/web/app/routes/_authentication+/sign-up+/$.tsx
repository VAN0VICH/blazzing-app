import { SignUp } from "@clerk/remix";
import { Flex, Grid, Heading } from "@radix-ui/themes";
const Register = () => {
	return (
		<Grid gap="4">
			<Heading size="8" align="center" className="font-freeman pb-4">
				Sign up to{" "}
				<span className="text-balance bg-gradient-to-b from-accent-9 to-accent-11 bg-clip-text font-bold text-transparent lg:tracking-tight ">
					Blazzing App
				</span>
			</Heading>

			<Flex direction="column" justify="center" gap="4" align="center">
				<SignUp />
			</Flex>
		</Grid>
	);
};
export default Register;
