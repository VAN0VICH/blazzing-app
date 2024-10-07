import { motion } from "framer-motion";

import { OnboardSchema } from "@blazzing-app/validators";
import {
	getFormProps,
	getInputProps,
	getSelectProps,
	useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	Button,
	Grid,
	ScrollArea,
	Select,
	Spinner,
	TextField,
} from "@radix-ui/themes";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";
import type { action } from ".";
import { StepHeader } from "./step-header";
export const UserOnboardSchema = OnboardSchema.and(
	z.object({ redirectTo: z.string().optional() }),
);

export function Onboard() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const [form, fields] = useForm({
		id: "onboard-form",
		constraint: getZodConstraint(UserOnboardSchema),
		defaultValue: { username: "", countryCode: "", redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, {
				schema: UserOnboardSchema,
			});
			return result;
		},
	});

	return (
		<motion.div
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, type: "spring" }}
			className="w-screen h-screen bg-background flex justify-center items-center"
		>
			<motion.div
				variants={{
					show: {
						transition: {
							staggerChildren: 0.2,
						},
					},
				}}
				initial="hidden"
				animate="show"
				className="flex flex-col space-y-4 rounded-lg max-w-lg bg-background/60 p-8"
			>
				<StepHeader
					title="Enter your username"
					description="You store will have the same name as your username. You can update it later."
				/>
				<motion.div
					variants={{
						hidden: { opacity: 0, x: 100 },
						show: {
							opacity: 1,
							x: 0,
							transition: { duration: 0.4, type: "spring" },
						},
					}}
				>
					<Form method="POST" className="grid w-full" {...getFormProps(form)}>
						<Grid gap="4">
							<label htmlFor="username" className="sr-only ">
								Username
							</label>
							<TextField.Root
								variant="soft"
								autoCapitalize="none"
								autoComplete="username"
								size="3"
								autoCorrect="off"
								disabled={isPending}
								placeholder="Enter username..."
								{...getInputProps(fields.username, { type: "text" })}
							/>
							{fields.username.errors && (
								<p className="px-1 text-sm text-red-9">
									{fields.username.errors[0]}
								</p>
							)}
							<label htmlFor="username" className="sr-only">
								Country
							</label>
							{/* @ts-ignore */}
							<Select.Root {...getSelectProps(fields.countryCode)} size="3">
								<Select.Trigger variant="soft" />
								<Select.Content>
									<ScrollArea>
										<Select.Item key={"AU"} value={"AU"}>
											Australia
										</Select.Item>
									</ScrollArea>
								</Select.Content>
							</Select.Root>
							{fields.countryCode.errors && (
								<p className="px-1 text-xs text-red-9">
									{fields.countryCode.errors[0]}
								</p>
							)}

							<div className="flex w-full justify-center">
								<Button
									variant="classic"
									type="submit"
									className="w-full"
									size="3"
									disabled={isPending}
								>
									{isPending && <Spinner />}
									Create user
								</Button>
							</div>
						</Grid>
					</Form>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
