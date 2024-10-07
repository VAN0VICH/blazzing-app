import { cn } from "@blazzing-app/ui";
import { Box, Flex, Heading, RadioGroup, Text } from "@radix-ui/themes";
import { useState } from "react";

const payments = ["stripe"];
export const PaymentInfo = () => {
	const [selected, setSelected] = useState<string | undefined>(undefined);
	return (
		<Box>
			<Heading size="4" className="py-2">
				Payment
			</Heading>
			<Flex>
				<RadioGroup.Root
					value={selected}
					onValueChange={setSelected}
					aria-label="Server size"
				>
					{payments.map((payment) => {
						return (
							<RadioGroup.Item
								key={payment}
								className="group relative flex cursor-pointer rounded-lg"
								value={payment}
							>
								<Flex
									gap="2"
									align="center"
									className={cn(
										"border group-data-[checked]:border-brand-3 border-border p-2 rounded-[5px]",
										{
											"group-data-[checked]:border-violet-400":
												payment === "stripe",
										},
									)}
								>
									<Text
										className={cn("font-semibold text-white", {
											"text-green-9": payment === "stripe",
										})}
									>
										{payment}
									</Text>
								</Flex>
							</RadioGroup.Item>
						);
					})}
				</RadioGroup.Root>
			</Flex>
		</Box>
	);
};
