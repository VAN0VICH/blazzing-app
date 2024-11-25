import type { DeliveryCheckoutForm, StoreUser } from "@blazzing-app/validators";
import { Box, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
export const CustomerInfo = ({
	user,
}: {
	user: StoreUser | null | undefined;
}) => {
	const { register, formState, clearErrors } =
		useFormContext<DeliveryCheckoutForm>();
	return (
		<Box>
			<Heading size="4" className="py-2">
				Customer information
			</Heading>

			<Grid className="grid grid-cols-1 md:grid-cols-2 gap-2">
				<Grid gap="2">
					<TextField.Root
						variant="soft"
						placeholder="Full name"
						size="3"
						{...register("fullName")}
						onChange={(e) => {
							register("fullName").onChange(e);
							clearErrors();
						}}
					/>
					<Text color="red" size="1">
						{formState.errors.fullName?.message}
					</Text>
				</Grid>
				{!user && (
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="Email"
							size="3"
							{...register("email")}
							onChange={(e) => {
								register("email").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.email?.message}
						</Text>
					</Grid>
				)}
				<Grid gap="2">
					<TextField.Root
						variant="soft"
						placeholder="Phone"
						size="3"
						{...register("phone")}
						onChange={(e) => {
							register("phone").onChange(e);
							clearErrors();
						}}
					/>
					<Text color="red" size="1">
						{formState.errors.phone?.message}
					</Text>
				</Grid>
			</Grid>
		</Box>
	);
};
