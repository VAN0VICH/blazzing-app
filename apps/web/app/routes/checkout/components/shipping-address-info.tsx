import { ISO_1666, type CheckoutForm } from "@blazzing-app/validators";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Box, Grid, Heading, Select, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";

export const ShippingAddressInfo = () => {
	const [parent] = useAutoAnimate({ duration: 100 });

	const { register, formState, control, clearErrors } =
		useFormContext<CheckoutForm>();

	return (
		<Box ref={parent}>
			<Heading size="4" className="py-2">
				Shipping address
			</Heading>

			<Grid gap="2" columns={{ initial: "1", sm: "2" }}>
				<Grid gap="2" className="col-span-1">
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="Address line 1"
							size="3"
							{...register("shippingAddress.line1")}
							onChange={(e) => {
								register("shippingAddress.line1").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.shippingAddress?.line1?.message}
						</Text>
					</Grid>
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="Address line 2"
							size="3"
							{...register("shippingAddress.line2")}
							onChange={(e) => {
								register("shippingAddress.line2").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.shippingAddress?.line2?.message}
						</Text>
					</Grid>

					<Controller
						name="shippingAddress.countryCode"
						control={control}
						render={({ field }) => (
							<Grid gap="2">
								<Select.Root {...field} onValueChange={field.onChange}>
									<Select.Trigger
										className="w-full rounded-[5px] h-10 px-2 "
										variant="soft"
									/>
									<Select.Content className="backdrop-blur-sm z-50">
										<Select.Group>
											{Object.entries(ISO_1666).map(([code, name]) => (
												<Select.Item key={code} value={code}>
													{name}
												</Select.Item>
											))}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								<Text color="red" size="1">
									{formState.errors.shippingAddress?.countryCode?.message}
								</Text>
							</Grid>
						)}
					/>
					{/* @ts-ignore */}
				</Grid>

				<Grid gap="2" className="col-span-1">
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="City"
							size="3"
							{...register("shippingAddress.city")}
							onChange={(e) => {
								register("shippingAddress.city").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.shippingAddress?.city?.message}
						</Text>
					</Grid>
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="Postal code"
							size="3"
							{...register("shippingAddress.postalCode")}
							onChange={(e) => {
								register("shippingAddress.postalCode").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.shippingAddress?.postalCode?.message}
						</Text>
					</Grid>
					<Grid gap="2">
						<TextField.Root
							variant="soft"
							placeholder="State"
							size="3"
							{...register("shippingAddress.state")}
							onChange={(e) => {
								register("shippingAddress.state").onChange(e);
								clearErrors();
							}}
						/>
						<Text color="red" size="1">
							{formState.errors.shippingAddress?.state?.message}
						</Text>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	);
};
