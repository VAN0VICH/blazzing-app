import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	RadioCards,
	RadioGroup,
	Theme,
	Tooltip,
} from "@radix-ui/themes";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action+/set-preferences";
import { capitalize } from "~/utils/helpers";
import {
	accentColors,
	getMatchingGrayColor,
	grayColors,
	scaling,
	type Preferences,
	type Scaling,
	type Theme as ThemeType,
} from "~/validators/state";

export default function Appearance() {
	const fetcher = useFetcher<typeof action>();

	const {
		theme,
		accentColor,
		grayColor,
		scaling: currentScaling,
	} = useUserPreferences();
	const autoMatchedGray = getMatchingGrayColor(accentColor ?? "ruby");
	const handlePreferenceChange = React.useCallback(
		(pref: Preferences) => {
			//@ts-ignore
			return fetcher.submit(pref, {
				method: "POST",
				action: "/action/set-preferences",
			});
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
					<Heading as="h2" size="4" className="text-accent-11">
						Theme
					</Heading>
				</Box>
				<Flex width="100%" justify={{ initial: "center", xs: "end" }}>
					<RadioGroup.Root
						value={theme}
						name="theme"
						onValueChange={(value) =>
							handlePreferenceChange({
								theme: value as ThemeType,
							})
						}
					>
						<RadioCards.Root
							gap="4"
							value={theme}
							onValueChange={(value) =>
								handlePreferenceChange({
									theme: value as ThemeType,
								})
							}
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
								<Theme appearance="dark" className=" ">
									<RadioCards.Item
										value="dark"
										className="w-[200px] h-[150px] bg-transparent     cursor-pointer"
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
												className="border-l border-t border- gray-5 dark:border- gray-8 rounded-tl-[7px]"
											>
												<Box
													width="60%"
													minHeight="129px"
													className="border-r border-border dark:border- gray-8"
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
																className="bg- gray-7  "
															/>
															<Box
																width="30px"
																height="4px"
																className="bg- gray-6  "
															/>
														</Flex>
														<Grid gap="1">
															<Box
																width="40px"
																height="4px"
																className="bg- gray-6  "
															/>
															<Box
																width="30px"
																height="4px"
																className="bg- gray-6  "
															/>
														</Grid>
														<Grid gap="1">
															<Box
																width="30px"
																height="4px"
																className="bg- gray-6  "
															/>
															<Box
																width="40px"
																height="4px"
																className="bg- gray-6  "
															/>
															<Box
																width="20px"
																height="4px"
																className="bg- gray-6  "
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
					<Heading as="h2" size="4" className="text-accent-11">
						Accent color
					</Heading>
				</Box>

				<Box width={{ initial: "75%", md: "100%" }}>
					<Flex gap="2" wrap="wrap">
						{accentColors.map((color) => (
							<label
								key={color}
								className="rt-ThemePanelSwatch"
								style={{ backgroundColor: `var(--${color}-9)` }}
							>
								<Tooltip content={capitalize(color)}>
									<input
										className="rt-ThemePanelSwatchInput"
										type="radio"
										name="accentColor"
										value={color}
										checked={accentColor === color}
										onChange={(event) =>
											handlePreferenceChange({
												accentColor: event.target.value as typeof accentColor,
											})
										}
									/>
								</Tooltip>
							</label>
						))}
					</Flex>
				</Box>
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
					<Heading as="h2" size="4" className="text-accent-11">
						Gray color
					</Heading>
				</Box>

				<Box width={{ initial: "75%", md: "100%" }}>
					<Flex gap="2" wrap="wrap">
						{grayColors.map((gray) => (
							<Flex key={gray} asChild align="center" justify="center">
								<label
									className="rt-ThemePanelSwatch"
									style={{
										backgroundColor:
											gray === "auto"
												? `var(--${autoMatchedGray}-9)`
												: gray === "gray"
													? "var(--gray-9)"
													: `var(--${gray}-9)`,
										// we override --gray so pure gray doesn't exist anymore
										// recover something as close as possible by desaturating
										filter: gray === "gray" ? "saturate(0)" : undefined,
									}}
								>
									<Tooltip
										content={`${capitalize(gray)}${
											gray === "auto" ? ` (${capitalize(autoMatchedGray)})` : ""
										}`}
									>
										<input
											className="rt-ThemePanelSwatchInput"
											type="radio"
											name="grayColor"
											value={gray}
											checked={grayColor === gray}
											onChange={(event) =>
												handlePreferenceChange({
													grayColor: event.target.value as typeof grayColor,
												})
											}
										/>
									</Tooltip>
								</label>
							</Flex>
						))}
					</Flex>
				</Box>
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
					<Heading as="h2" size="4" className="text-accent-11">
						Scaling
					</Heading>
				</Box>

				<Box width={{ initial: "75%", md: "100%" }}>
					<Flex gap="2" wrap="wrap">
						<ToggleGroup
							value={currentScaling ?? "100%"}
							onValueChange={(value) =>
								handlePreferenceChange({ scaling: value as Scaling })
							}
							type="single"
							className="gap-2"
						>
							{scaling.map((num) => (
								<ToggleGroupItem
									className="w-full aspect-square min-w-[50px]     p-4 text-sm flex"
									value={num}
									key={num}
								>
									{num}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
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
				className="border-x border-t dark:border- gray-8 rounded-t-[6px]"
			>
				<Box
					width="30%"
					className="border-r border-border dark:border- gray-8"
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
								className="bg- gray-7  dark:bg- gray-8  "
							/>
							<Box
								width="30px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
						</Flex>
						<Grid gap="1">
							<Box
								width="40px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
							<Box
								width="30px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
						</Grid>
						<Grid gap="1">
							<Box
								width="30px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
							<Box
								width="40px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
							<Box
								width="20px"
								height="4px"
								className="bg- gray-6 dark:bg- gray-8  "
							/>
						</Grid>
					</Grid>
				</Box>
				<Box width="70%" />
			</Flex>
		</Box>
	);
};
