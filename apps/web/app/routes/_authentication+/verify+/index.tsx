import { LoadingSpinner } from "@blazzing-app/ui/loading";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Text,
	TextField,
} from "@radix-ui/themes";
import { Form } from "@remix-run/react";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";

function Verify() {
	const isPending = useIsPending();

	const [form, fields] = useForm({
		id: "verify-form",
		constraint: getZodConstraint(
			z.object({
				otp: z.string(),
			}),
		),
		defaultValue: { otp: "" },
	});

	return (
		<Flex align="center" justify="center">
			<Grid gap="4">
				<Heading align="center" size="8" className="font-freeman">
					Enter code
				</Heading>
				<Text size="4" as="p" color="gray" align="center">
					Check your email.
				</Text>
				<Form method="POST" {...getFormProps(form)}>
					<Flex direction="column" justify="center" gap="4" align="center">
						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<TextField.Root
								size="3"
								className="w-full"
								placeholder="Enter code"
								{...getInputProps(fields.otp, { type: "text" })}
							/>
						</Box>

						{fields.otp.errors && (
							<p className="px-1 text-sm text-red-9">{fields.otp.errors[0]}</p>
						)}

						<Box maxWidth="400px" width={{ initial: "100%", xs: "400px" }}>
							<Button
								variant="classic"
								type="submit"
								className="w-full"
								size="3"
								disabled={isPending}
							>
								{isPending && <LoadingSpinner className="text-white size-4" />}
								Submit
							</Button>
						</Box>
					</Flex>
				</Form>
			</Grid>
		</Flex>
	);
}
export default Verify;
