import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import type { Store } from "@blazzing-app/validators/client";
import {
	Box,
	Button,
	Card,
	Flex,
	Heading,
	Tabs,
	Theme,
} from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import React, { useEffect, useState } from "react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { StoreComponent } from "~/components/templates/store";
import { store } from "~/temp/mock-entities";
import type { AccentColor } from "~/validators/state";
import { Products } from "../../components/templates/product/products";
import { tags } from "~/constants";

export default function MarketplaceLayout() {
	const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
	return (
		<SidebarLayoutWrapper>
			<div className="absolute -z-10 left-0 right-0 h-[550px] opacity-60 bg-gradient-to-b from-brand-2 to-transparent " />
			<main className="p-2 lg:p-4 mt-16 flex flex-col justify-center bg-gray-1">
				<Flex justify="center" align="center">
					<Icons.Flame className="text-accent-11" />
					<Heading className="text-accent-11 text-center py-4 ">
						Trending
					</Heading>
				</Flex>
				<Featured />
				<Tabs.Root
					defaultValue="forYou"
					className="pt-3 flex items-center flex-col"
				>
					<Tabs.List className="gap-10">
						<Tabs.Trigger value="forYou" className="text-lg">
							For you
						</Tabs.Trigger>
						<Tabs.Trigger value="following" className="text-lg">
							Following
						</Tabs.Trigger>
					</Tabs.List>

					<Box pt="4">
						<Tabs.Content value="forYou">
							<Flex
								justify="between"
								align="center"
								direction={{ initial: "column", sm: "row" }}
							>
								<Flex gap="3" wrap="wrap" py="4" width="100%">
									{tags.map((tag) => (
										<Button
											key={tag.color}
											color={tag.color as AccentColor}
											variant={activeTags.has(tag.name) ? "solid" : "surface"}
											onClick={() =>
												setActiveTags((prev) => {
													const newSet = new Set(prev);
													if (newSet.has(tag.name)) {
														newSet.delete(tag.name);
													} else {
														newSet.add(tag.name);
													}
													return newSet;
												})
											}
										>
											{tag.name}
										</Button>
									))}
								</Flex>
								<Flex justify="end" width="100%" pb="4">
									<Button variant="outline">
										<Icons.Filters className="size-4" />
										Filters
									</Button>
								</Flex>
							</Flex>
							<Products />
						</Tabs.Content>

						<Tabs.Content value="following">
							<Box className="h-screen flex justify-center items-center">
								Nothing bro
							</Box>
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</main>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
const Featured = () => {
	const stores: Store[] = [
		store,
		{ ...store, id: "awdaw1" },
		{ ...store, id: "121" },
		{ ...store, id: "124" },
		{ ...store, id: "1242" },
		{ ...store, id: "12422" },
	];
	if (stores.length < 5) {
		return <Featured3 stores={stores} />;
	}
	return <Featured5 stores={stores} />;
};

const Featured3 = ({ stores }: { stores: Store[] }) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [direction, setDirection] = useState<number>(0);
	console.log("stores", stores);

	useEffect(() => {
		if (stores.length > 0) {
			setCurrentIndex(0);
		}
	}, [stores]);

	if (!stores || stores.length === 0) {
		return null;
	}
	const slideVariants = {
		hidden: (custom: {
			direction: number;
			position: "left" | "center" | "right";
		}) => ({
			x: custom.direction > 0 ? "100%" : "-100%",
			scale: 0.8,
			opacity: 0,
		}),
		visible: (custom: { position: "left" | "center" | "right" }) => ({
			x:
				custom.position === "left"
					? "-50%"
					: custom.position === "right"
						? "50%"
						: "0%",
			scale: custom.position === "center" ? 1 : 0.8,
			zIndex: custom.position === "center" ? 2 : 1,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		}),
		exit: (custom: {
			direction: number;
			position: "left" | "center" | "right";
		}) => ({
			x: custom.direction < 0 ? "100%" : "-100%",
			scale: 0.8,
			opacity: 0,
		}),
	};

	const swipe = (newDirection: number): void => {
		setDirection(newDirection);
		setCurrentIndex((prevIndex) => {
			let newIndex = prevIndex + newDirection;
			if (newIndex < 0) newIndex = stores.length - 1;
			if (newIndex >= stores.length) newIndex = 0;
			return newIndex;
		});
	};

	const dragEndHandler = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	): void => {
		const swipeThreshold = 50;
		if (info.offset.x > swipeThreshold) {
			swipe(-1);
		} else if (info.offset.x < -swipeThreshold) {
			swipe(1);
		}
	};

	return (
		<div className="mb-10">
			<Flex
				position="relative"
				justify="start"
				className=" h-[410px] overflow-hidden"
			>
				<AnimatePresence initial={false} custom={{ direction }}>
					{[-1, 0, 1].map((offset) => {
						const index =
							(currentIndex + offset + stores.length) % stores.length;
						const position =
							offset === -1 ? "left" : offset === 0 ? "center" : "right";
						return (
							<motion.div
								key={stores[index]!.id}
								custom={{ direction, position }}
								variants={slideVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute top-0 left-[0.5px] md:left-[25%] lg:left-[30%] p-2 -translate-x-1/2 md:min-w-[500px] w-full  md:w-5/12 h-full",
									position !== "center",
								)}
								drag={position === "center" ? "x" : false}
								dragConstraints={
									position === "center" ? { left: 0, right: 0 } : {}
								}
								onDragEnd={position === "center" ? dragEndHandler : () => {}}
								onClick={() => {
									if (position === "left") swipe(-1);
									if (position === "right") swipe(1);
								}}
							>
								<Theme scaling="95%">
									<Card className="shadow-lg shadow-accent-3 border border-accent-5">
										<StoreComponent storeURL={`/${store.name}`} />
									</Card>
								</Theme>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</Flex>
		</div>
	);
};
const Featured5 = ({ stores }: { stores: Store[] }) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [direction, setDirection] = useState<number>(0);
	console.log("stores", stores);

	useEffect(() => {
		if (stores.length > 0) {
			setCurrentIndex(0);
		}
	}, [stores]);

	if (!stores || stores.length === 0) {
		return null;
	}

	const slideVariants = {
		hidden: (custom: {
			direction: number;
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x: custom.direction > 0 ? "100%" : "-100%",
			scale: 0.6,
			opacity: 0,
		}),
		visible: (custom: {
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x:
				custom.position === "far-left"
					? "-60%"
					: custom.position === "left"
						? "-40%"
						: custom.position === "right"
							? "40%"
							: custom.position === "far-right"
								? "60%"
								: "0%",
			scale:
				custom.position === "center"
					? 1
					: custom.position === "left" || custom.position === "right"
						? 0.8
						: 0.6,
			zIndex:
				custom.position === "center"
					? 5
					: custom.position === "left" || custom.position === "right"
						? 3
						: 1,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		}),
		exit: (custom: {
			direction: number;
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x: custom.direction < 0 ? "100%" : "-100%",
			scale: 0.6,
			opacity: 0,
		}),
	};

	const swipe = (newDirection: number): void => {
		setDirection(newDirection);
		setCurrentIndex((prevIndex) => {
			let newIndex = prevIndex + newDirection;
			if (newIndex < 0) newIndex = stores.length - 1;
			if (newIndex >= stores.length) newIndex = 0;
			return newIndex;
		});
	};

	const dragEndHandler = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	): void => {
		const swipeThreshold = 50;
		if (info.offset.x > swipeThreshold) {
			swipe(-1);
		} else if (info.offset.x < -swipeThreshold) {
			swipe(1);
		}
	};

	return (
		<div className="mb-10">
			<div className="relative h-[410px] ">
				<AnimatePresence initial={false} custom={{ direction }}>
					{[-2, -1, 0, 1, 2].map((offset) => {
						const index =
							(currentIndex + offset + stores.length) % stores.length;
						const position =
							offset === -2
								? "far-left"
								: offset === -1
									? "left"
									: offset === 0
										? "center"
										: offset === 1
											? "right"
											: "far-right";
						return (
							<motion.div
								key={stores[index]!.id}
								custom={{ direction, position }}
								variants={slideVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute top-0 overflow-hidden left-[0.5px]  md:left-[25%] lg:left-[30%] p-2 -translate-x-1/2 md:min-w-[500px] w-full md:w-5/12 h-full",
									(position === "far-left" || position === "far-right") &&
										"hidden lg:flex",
									(position === "left" || position === "right") &&
										"hidden md:flex",
								)}
								drag={position === "center" ? "x" : false}
								dragConstraints={
									position === "center" ? { left: 0, right: 0 } : {}
								}
								onDragEnd={position === "center" ? dragEndHandler : () => {}}
								onClick={() => {
									if (position === "far-left" || position === "left") swipe(-1);
									if (position === "far-right" || position === "right")
										swipe(1);
								}}
							>
								<Theme scaling="95%">
									<Card className="shadow-lg shadow-accent-3 border border-accent-5">
										<StoreComponent storeURL={`/stores/${store.name}`} />
									</Card>
								</Theme>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
};
