import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	RadioCards,
	RadioGroup,
	Theme,
} from "@radix-ui/themes";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useOptimisticAccentMode } from "~/hooks/use-accent-color";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action+/set-theme";
import {
	accentColors,
	type AccentColor,
	type Theme as ThemeType,
} from "~/validators/state";

export default function Appearance() {
	const fetcher = useFetcher<typeof action>();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticThemeMode();
	const optimisticAccentColor = useOptimisticAccentMode();
	const accentColor =
		optimisticAccentColor ?? userPreference.accentColor ?? "ruby";
	const theme = optimisticMode ?? userPreference.theme ?? "system";
	const handleThemeChange = React.useCallback(
		(theme: ThemeType) => {
			return fetcher.submit(
				{
					theme,
				},
				{
					method: "POST",
					action: "/action/set-theme",
				},
			);
		},
		[fetcher.submit],
	);
	const handleAccentColorChange = React.useCallback(
		(color: AccentColor) => {
			console.log("color", color);
			return fetcher.submit(
				{
					color,
				},
				{
					method: "POST",
					action: "/action/set-accent-color",
				},
			);
		},
		[fetcher.submit],
	);
	return (
		<Container
			minHeight="100vh"
			px={{ initial: "2", xs: "4" }}
			pb={{ initial: "9", md: "0" }}
		>
			<Flex
				py="6"
				width="100%"
				direction={{ initial: "column", xs: "row" }}
				justify="end"
			>
				<Box
					width={{ initial: "25%", md: "60%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="6" className="font-freeman" color="gray">
						Theme
					</Heading>
				</Box>
				<Flex width="100%" justify={{ initial: "center", xs: "end" }}>
					<RadioGroup.Root
						value={theme}
						name="example"
						onValueChange={handleThemeChange}
					>
						<RadioCards.Root
							gap="4"
							value={theme}
							onValueChange={handleThemeChange}
							columns={{ initial: "1", xs: "2", lg: "3" }}
						>
							<Grid gap="2">
								<Theme
									appearance="light"
									className="w-[200px] h-[150px]  bg-transparent"
								>
									<RadioCards.Item
										value="light"
										className="w-[200px] h-[150px] bg-transparent cursor-pointer"
									>
										<Display />
									</RadioCards.Item>
								</Theme>
								<RadioGroup.Item value="light">Light</RadioGroup.Item>
							</Grid>

							<Grid gap="2">
								<Theme appearance="dark" className="rounded-[7px]">
									<RadioCards.Item
										value="dark"
										className="w-[200px] h-[150px] bg-transparent rounded-[6px] cursor-pointer"
									>
										<Display />
									</RadioCards.Item>
								</Theme>
								<RadioGroup.Item value="dark">Dark</RadioGroup.Item>
							</Grid>

							<Grid gap="2">
								<RadioCards.Item
									value="inherit"
									className="w-[200px] h-[150px] bg-transparent cursor-pointer"
								>
									<Flex minWidth="200px" minHeight="150px">
										<Theme appearance="light" className="w-full relative">
											<Box
												minWidth="91px"
												minHeight="129px"
												position="absolute"
												bottom="0"
												left="2"
												className="border-l border-t border-mauve-5 dark:border-mauve-8 rounded-tl-[7px]"
											>
												<Box
													width="60%"
													minHeight="129px"
													className="border-r border-border dark:border-mauve-8"
													p="2"
												>
													<Flex gap="1">
														<Box
															className="rounded-full bg-red-9"
															width="6px"
															height="6px"
														/>
														<Box
															className="rounded-full bg-orange-9"
															width="6px"
															height="6px"
														/>
														<Box
															className="rounded-full bg-green-9"
															width="6px"
															height="6px"
														/>
													</Flex>
													<Grid gap="2">
														<Flex
															direction="column"
															justify="center"
															align="center"
															pt="2"
															gap="1"
														>
															<Box
																width="20px"
																height="20px"
																className="bg-mauve-7 rounded-[3px]"
															/>
															<Box
																width="30px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
														</Flex>
														<Grid gap="1">
															<Box
																width="40px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
															<Box
																width="30px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
														</Grid>
														<Grid gap="1">
															<Box
																width="30px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
															<Box
																width="40px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
															<Box
																width="20px"
																height="4px"
																className="bg-mauve-6 rounded-[2px]"
															/>
														</Grid>
													</Grid>
												</Box>
											</Box>
										</Theme>
										<Theme
											appearance="dark"
											className="w-full relative rounded-tr-[7px]"
										>
											<Box
												minWidth="91px"
												minHeight="130px"
												position="absolute"
												bottom="0"
												right="2"
												className="border-r border-t border-border rounded-tr-[6px]"
											/>
										</Theme>
									</Flex>
								</RadioCards.Item>

								<RadioGroup.Item value="inherit">System</RadioGroup.Item>
							</Grid>
						</RadioCards.Root>
					</RadioGroup.Root>
				</Flex>
			</Flex>

			<Flex
				className="border-y border-border"
				py="6"
				direction={{ initial: "column", xs: "row" }}
			>
				<Box
					width={{ initial: "25%", md: "100%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="6" className="font-freeman" color="gray">
						Accent color
					</Heading>
				</Box>

				<Box width={{ initial: "75%", md: "100%" }}>
					<Flex gap="2" wrap="wrap">
						{accentColors.map((color) => (
							<Button
								key={color}
								color={color}
								variant={accentColor === color ? "solid" : "surface"}
								onClick={() => handleAccentColorChange(color as AccentColor)}
							>
								{color}
							</Button>
						))}
					</Flex>
				</Box>
			</Flex>
		</Container>
	);
}
const Display = () => {
	return (
		<Box position="relative" minWidth="200px" minHeight="150px">
			<Flex
				minWidth="180px"
				minHeight="130px"
				position="absolute"
				bottom="0"
				left="2"
				className="border-x border-t dark:border-mauve-8 rounded-t-[6px]"
			>
				<Box
					width="30%"
					className="border-r border-border dark:border-mauve-8"
					p="2"
				>
					<Flex gap="1">
						<Box className="rounded-full bg-red-9" width="6px" height="6px" />
						<Box
							className="rounded-full bg-orange-9"
							width="6px"
							height="6px"
						/>
						<Box className="rounded-full bg-green-9" width="6px" height="6px" />
					</Flex>
					<Grid gap="2">
						<Flex
							direction="column"
							justify="center"
							align="center"
							pt="2"
							gap="1"
						>
							<Box
								width="20px"
								height="20px"
								className="bg-mauve-7  dark:bg-mauve-8 rounded-[3px]"
							/>
							<Box
								width="30px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
						</Flex>
						<Grid gap="1">
							<Box
								width="40px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
							<Box
								width="30px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
						</Grid>
						<Grid gap="1">
							<Box
								width="30px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
							<Box
								width="40px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
							<Box
								width="20px"
								height="4px"
								className="bg-mauve-6 dark:bg-mauve-8 rounded-[2px]"
							/>
						</Grid>
					</Grid>
				</Box>
				<Box width="70%" />
			</Flex>
		</Box>
	);
};
