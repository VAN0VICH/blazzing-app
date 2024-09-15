import { cn } from "@blazzing-app/ui";
import { Ping } from "@blazzing-app/ui/ping";
import type { Product, Variant } from "@blazzing-app/validators/client";
import { AlertDialog, Badge, Button, Flex, Grid } from "@radix-ui/themes";
import { useState } from "react";
import { Attributes } from "./input/product-attributes";
import { ProductInfo } from "./input/product-info";
import { Media } from "./input/product-media";
import { ProductOptions } from "./input/product-options";
import { Organize } from "./input/product-organize";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";
import { Variants } from "./input/product-variants";

export interface ProductInputProps {
	product: Product | undefined;
	productID: string;
	baseVariant: Variant | undefined;
	setView: (value: "preview" | "input") => void;
}
export function ProductInput({
	productID,
	product,
	baseVariant,
	setView,
}: ProductInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isOpen1, setIsOpen1] = useState(false);

	return (
		<main className="relative flex flex-col min-h-screen pb-20 max-w-7xl w-full gap-3 min-[1200px]:flex min-[1200px]:flex-row min-w-[15rem] px-3">
			<AlertDialog.Root>
				<AlertDialog.Content maxWidth="450px" className="backdrop-blur-sm">
					<AlertDialog.Title>Revoke access</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure? This application will no longer be accessible and any
						existing sessions will be expired.
					</AlertDialog.Description>

					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button variant="solid" color="red">
								Revoke access
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
			<Flex
				direction="column"
				width="100%"
				className="lg:min-w-[44rem] xl:max-w-[50rem]"
			>
				<Flex justify="between" align="center" className="h-14">
					<Badge color={(baseVariant?.quantity ?? 0) <= 0 ? "red" : "jade"}>
						<Ping
							className={cn("bg-jade-9", {
								"bg-red-9": (baseVariant?.quantity ?? 0) <= 0,
							})}
						/>
						{(baseVariant?.quantity ?? 0) <= 0 ? "Out of stock" : "In stock"}
					</Badge>
					<Flex
						align="center"
						gap="2"
						display={{ initial: "flex", md: "none" }}
					>
						<DeleteOrPublish
							setView={setView}
							setIsOpen1={setIsOpen1}
							onPublish={() => {}}
							productStatus={product?.status ?? "draft"}
							updateProduct={() => {
								return new Promise((resolve) => resolve());
							}}
						/>
					</Flex>
				</Flex>
				<Grid gap="3">
					<ProductInfo
						updateProduct={() => {
							return new Promise((resolve) => resolve());
						}}
						baseVariant={baseVariant}
						product={product}
						updateVariant={() => {
							return new Promise((resolve) => resolve());
						}}
					/>
					<Media
						images={baseVariant?.images ?? []}
						variantID={baseVariant?.id}
					/>
					<ProductOptions
						options={product?.options ?? []}
						productID={productID}
					/>
					<Variants
						productID={productID}
						product={product}
						variants={[]}
						baseVariant={baseVariant}
						isPublished={product?.status === "published"}
					/>
					<Stock
						variant={baseVariant}
						updateVariant={() => {
							return new Promise((resolve) => resolve());
						}}
					/>
				</Grid>
			</Flex>

			<Flex
				width="full"
				direction="column"
				className="w-full min-[1200px]:max-w-[25rem]"
			>
				<section className="hidden min-[1200px]:flex items-center order-1 justify-end gap-2 h-14">
					<DeleteOrPublish
						setView={setView}
						setIsOpen1={setIsOpen1}
						onPublish={() => {}}
						updateProduct={() => {
							return new Promise((resolve) => resolve());
						}}
						productStatus={product?.status ?? "draft"}
					/>
				</section>
				<Flex direction="column" gap="3" className="order-2 w-full">
					<Pricing
						isPublished={product?.status === "published"}
						variantID={baseVariant?.id}
						prices={baseVariant?.prices ?? []}
					/>
					<Organize product={product} />
					<Attributes variant={baseVariant} />
				</Flex>
			</Flex>
		</main>
	);
}

function DeleteOrPublish({
	setIsOpen1,
	onPublish,
	productStatus,
	setView,
	updateProduct,
}: {
	setIsOpen1: (value: boolean) => void;
	onPublish: () => void;
	setView: (value: "preview" | "input") => void;
	updateProduct: () => Promise<void>;
	productStatus: Product["status"];
}) {
	return (
		<>
			<Button
				variant="soft"
				type="button"
				size="2"
				onClick={async () => {
					setView("preview");
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						setView("preview");
					}
				}}
			>
				Preview
			</Button>
			<Button
				variant="outline"
				type="button"
				size="2"
				onClick={async () => {
					setIsOpen1(true);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						setIsOpen1(true);
					}
				}}
			>
				Delete
			</Button>

			<Button size="2" variant="classic">
				{productStatus === "published" ? "Unpublish" : "Publish"}
			</Button>
		</>
	);
}
