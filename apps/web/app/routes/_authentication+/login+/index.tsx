import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";

import { LoadingSpinner } from "@blazzing-app/ui/loading";
import { EmailSchema } from "@blazzing-app/validators";
import { useCallback } from "react";
import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Text,
	TextField,
} from "@radix-ui/themes";
const schema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
});
const Login = () => {
	const isPending = useIsPending();
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const [form, fields] = useForm({
		id: "login-form",
		constraint: getZodConstraint(schema),
		defaultValue: { redirectTo, email: "" },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});
	const onGoogleClick = useCallback(() => {
		return fetcher.submit(
			{},
			{
				method: "POST",
				action: "/google/login",
			},
		);
	}, [fetcher.submit]);

	const isEmailSubmitting = fetcher.state === "submitting";

	const isGoogleSubmitting = fetcher.state === "submitting";

	return (
		<Flex align="center" justify="center" className="py-20 lg:py-0">
			<Grid gap="4">
				<Heading size="8" align="center" className="font-freeman pb-4">
					Welcome to{" "}
					<span className="text-balance bg-gradient-to-b from-brand-9 to-brand-11 bg-clip-text font-bold text-transparent lg:tracking-tight ">
						Blazzing App
					</span>
				</Heading>

				<fetcher.Form method="POST" {...getFormProps(form)}>
					<Flex direction="column" justify="center" gap="4" align="center">
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<TextField.Root
								size="3"
								className="w-full"
								placeholder="email@example.com"
								{...getInputProps(fields.email, { type: "email" })}
							/>
						</Box>

						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Button
								variant="classic"
								type="submit"
								className="w-full"
								size="3"
								disabled={isPending || isEmailSubmitting}
							>
								{(isPending || isEmailSubmitting) && (
									<LoadingSpinner className="text-white size-4 " />
								)}
								Continue with email
							</Button>
						</Box>
						<Box className="relative flex justify-center text-xs uppercase">
							<Text color="gray" className="px-2">
								Or continue with
							</Text>
						</Box>
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Button
								type="button"
								variant="outline"
								size="3"
								color="gray"
								className="w-full"
								onClick={onGoogleClick}
								disabled={isPending || isGoogleSubmitting}
							>
								{(isPending || isGoogleSubmitting) && (
									<LoadingSpinner className="text-slate-11 size-4 mr-2" />
								)}
								Google
							</Button>
						</Box>
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Text align="center" color="gray" className="w-full">
								By clicking continue, you agree to our{" "}
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
				</fetcher.Form>
			</Grid>
		</Flex>
	);
};
export default Login;
