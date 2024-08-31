import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@blazzing-app/ui/input-otp";
import { LoadingSpinner } from "@blazzing-app/ui/loading";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
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
		<Flex
			align={{ initial: "start", md: "center" }}
			pt={{ initial: "9", md: "0" }}
			justify="center"
			height="100vh"
		>
			<Grid gap="4">
				<Heading align="center" size="8" className="font-freeman">
					Enter code
				</Heading>
				<Text size="4" as="p" color="gray" align="center">
					Check your email.
				</Text>
				<Form method="POST" {...getFormProps(form)}>
					<Flex direction="column" justify="center" gap="4" align="center">
						<Flex
							justify="center"
							maxWidth="400px"
							width={{ initial: "100%", xs: "400px" }}
						>
							<InputOTP
								maxLength={6}
								pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
								className="bg-component border border-border"
								disabled={isPending}
								autoFocus
								{...getInputProps(fields.otp, { type: "text" })}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</Flex>

						{fields.otp.errors && (
							<p className="px-1 text-sm text-red-9">{fields.otp.errors[0]}</p>
						)}

						<Flex
							justify="center"
							maxWidth="400px"
							width={{ initial: "100%", xs: "400px" }}
						>
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
						</Flex>
					</Flex>
				</Form>
			</Grid>
		</Flex>
	);
}
export default Verify;
