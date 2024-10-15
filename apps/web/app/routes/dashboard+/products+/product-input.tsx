import { cn } from "@blazzing-app/ui";
import { Ping } from "@blazzing-app/ui/ping";
import { toast } from "@blazzing-app/ui/toast";
import type { Product, Variant } from "@blazzing-app/validators/client";
import { AlertDialog, Badge, Button, Flex, Grid } from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import React from "react";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import { Attributes } from "./input/product-attributes";
import { ProductInfo } from "./input/product-info";
import { Media } from "./input/product-media";
import { ProductOptions } from "./input/product-options";
import { Organize } from "./input/product-organize";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";
import { Variants } from "./input/product-variants";
import type { UpdateProduct, UpdateVariant } from "@blazzing-app/validators";
import { useUserPreferences } from "~/hooks/use-user-preferences";

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
	const [isPublishAlertOpen, setIsPublishAlertOpen] = React.useState(false);
	const [isUnpublishAlertOpen, setIsUnpublishAlertOpen] = React.useState(false);
	const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
	const variants = useDashboardStore((state) =>
		state.variants.filter(
			(v) => v.productID === productID && v.id !== baseVariant?.id,
		),
	);

	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const navigate = useNavigate();
	const updateProduct = React.useCallback(
		async (updates: UpdateProduct["updates"]) => {
			if (dashboardRep && productID) {
				await dashboardRep.mutate.updateProduct({
					id: productID,
					updates,
					storeID: product?.storeID,
				});
			}
		},
		[dashboardRep, productID, product?.storeID],
	);

	const updateVariant = React.useCallback(
		async (props: UpdateVariant) => {
			if (dashboardRep) {
				await dashboardRep.mutate.updateVariant({
					id: props.id,
					updates: props.updates,
				});
			}
		},
		[dashboardRep],
	);

	const deleteProduct = React.useCallback(async () => {
		await dashboardRep?.mutate.deleteProduct({ keys: [productID] });
		toast.success("Product deleted!");
		navigate("/dashboard/products");
	}, [dashboardRep, productID, navigate]);
	const publishProduct = React.useCallback(async () => {
		await dashboardRep?.mutate.publishProduct({ id: productID });
		toast.success("Product published!");
	}, [dashboardRep, productID]);
	const totalStock =
		variants.reduce((acc, curr) => acc + (curr.quantity ?? 0), 0) +
		(baseVariant?.quantity ?? 0);

	const onPublish = React.useCallback(() => {
		/* check prices */
		if (!baseVariant?.prices || baseVariant.prices.length === 0) {
			toast.error("Please add price to the product");
			return;
		}
		if (baseVariant.quantity <= 0) {
			console.log("baseVariant.quantity", baseVariant.quantity);
			toast.error("Please add quantity to the product");
			return;
		}
		if (!baseVariant.title || baseVariant.title === "") {
			toast.error("Please add title to the product");
			return;
		}
		const v0 = variants.find((variant) => variant.quantity <= 0);
		if (v0) {
			toast.error("Please add a quantity to all variants");
			return;
		}
		const v1 = variants.find(
			(variant) => (variant.optionValues ?? []).length === 0,
		);
		if (v1) {
			toast.error(
				`Please add a product option to variant ${
					v1.title ?? v1.optionValues?.[0] ?? ""
				}`,
			);
			return;
		}
		const v2 = variants.find((variant) => (variant.prices ?? []).length === 0);
		if (v2) {
			toast.error(
				`Please add price to the product variant "${
					v2.title ?? v2.optionValues?.[0]?.optionValue.value ?? ""
				}"`,
			);
			return;
		}

		setIsPublishAlertOpen(true);
	}, [baseVariant, variants]);
	const onDelete = React.useCallback(() => {
		setIsDeleteAlertOpen(true);
	}, []);
	const onUnpublish = React.useCallback(() => {
		setIsUnpublishAlertOpen(true);
	}, []);
	const { accentColor } = useUserPreferences();

	return (
		<main className="relative flex flex-col min-h-screen max-w-[1700px] w-full gap-3 min-[1200px]:flex min-[1200px]:flex-row min-w-[15rem] px-3">
			<Alerts
				deleteProduct={deleteProduct}
				isDeleteAlertOpen={isDeleteAlertOpen}
				isPublishAlertOpen={isPublishAlertOpen}
				isUnpublishAlertOpen={isUnpublishAlertOpen}
				publishProduct={publishProduct}
				setIsDeleteAlertOpen={setIsDeleteAlertOpen}
				setIsPublishAlertOpen={setIsPublishAlertOpen}
				setIsUnpublishAlertOpen={setIsUnpublishAlertOpen}
				updateProduct={updateProduct}
			/>
			<Flex
				direction="column"
				width="100%"
				className="lg:min-w-[44rem] xl:max-w-[80rem]"
			>
				<Flex justify="between" align="center" className="h-14">
					<Badge
						size="3"
						color={
							(baseVariant?.quantity ?? 0) <= 0
								? "red"
								: (accentColor ?? "ruby")
						}
					>
						<Ping
							className={cn("bg-accent-11", {
								"bg-red-11": (baseVariant?.quantity ?? 0) <= 0,
							})}
						/>
						{totalStock <= 0 ? "Out of stock" : "In stock"}
					</Badge>
					<section className="min-[1200px]:hidden flex items-center justify-end gap-2 h-14">
						<DeleteOrPublish
							product={product}
							setView={setView}
							onPublish={onPublish}
							productStatus={product?.status ?? "draft"}
							onDelete={onDelete}
							onUnpublish={onUnpublish}
						/>
					</section>
				</Flex>
				<Grid gap="3">
					<ProductInfo
						updateProduct={updateProduct}
						baseVariant={baseVariant}
						product={product}
						updateVariant={updateVariant}
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
						variants={variants}
						baseVariant={baseVariant}
						isPublished={product?.status === "published"}
					/>
					<Stock variant={baseVariant} updateVariant={updateVariant} />
				</Grid>
			</Flex>

			<Flex
				width="full"
				direction="column"
				className="w-full min-[1200px]:max-w-[28rem]"
			>
				<section className="hidden min-[1200px]:flex items-center order-1 justify-end gap-2 h-14">
					<DeleteOrPublish
						product={product}
						setView={setView}
						onPublish={onPublish}
						productStatus={product?.status ?? "draft"}
						onDelete={onDelete}
						onUnpublish={onUnpublish}
					/>
				</section>
				<Flex direction="column" gap="3" className="order-2 w-full">
					<Pricing
						isPublished={product?.status === "published"}
						variantID={baseVariant?.id}
						prices={baseVariant?.prices ?? []}
					/>
					<Organize product={product} />
					<Attributes variant={baseVariant} updateVariant={updateVariant} />
				</Flex>
			</Flex>
		</main>
	);
}

function DeleteOrPublish({
	onPublish,
	product,
	productStatus,
	setView,
	onDelete,
	onUnpublish,
}: {
	product: Product | undefined;
	onPublish: () => void;
	onDelete: () => void;
	onUnpublish: () => void;
	setView: (value: "preview" | "input") => void;
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
				variant="surface"
				onClick={onDelete}
				onKeyDown={async (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						onDelete();
					}
				}}
			>
				Delete
			</Button>
			<Button
				variant="solid"
				onClick={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					productStatus !== "published" ? onPublish() : onUnpublish();
				}}
				onKeyDown={async (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						productStatus !== "published" ? onPublish() : onUnpublish();
					}
				}}
			>
				{product?.status === "published" ? "Unpublish" : "Publish"}
			</Button>
		</>
	);
}

const Alerts = ({
	isDeleteAlertOpen,
	isPublishAlertOpen,
	isUnpublishAlertOpen,
	setIsDeleteAlertOpen,
	setIsPublishAlertOpen,
	updateProduct,
	setIsUnpublishAlertOpen,
	publishProduct,
	deleteProduct,
}: {
	isPublishAlertOpen: boolean;
	setIsPublishAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isUnpublishAlertOpen: boolean;
	setIsUnpublishAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isDeleteAlertOpen: boolean;
	setIsDeleteAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
	publishProduct: () => Promise<void>;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
	deleteProduct: () => Promise<void>;
}) => {
	return (
		<>
			<AlertDialog.Root
				open={isPublishAlertOpen}
				onOpenChange={setIsPublishAlertOpen}
			>
				<AlertDialog.Content maxWidth="450px">
					<AlertDialog.Title>Publish product</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure? You followers will be notified.
					</AlertDialog.Description>

					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button
								variant="solid"
								onClick={publishProduct}
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										await publishProduct();
									}
								}}
							>
								Publish
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
			<AlertDialog.Root
				open={isUnpublishAlertOpen}
				onOpenChange={setIsUnpublishAlertOpen}
			>
				<AlertDialog.Content maxWidth="450px">
					<AlertDialog.Title>Unpublish product</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure? Your product will not be accessible to your customers.
					</AlertDialog.Description>

					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button
								variant="solid"
								onClick={async () => {
									await updateProduct({ status: "draft" });
								}}
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										await updateProduct({ status: "draft" });
									}
								}}
							>
								Unpublish
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
			<AlertDialog.Root
				open={isDeleteAlertOpen}
				onOpenChange={setIsDeleteAlertOpen}
			>
				<AlertDialog.Content maxWidth="450px">
					<AlertDialog.Title>Delete product</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure? Your product will be permanently deleted.
					</AlertDialog.Description>

					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button
								variant="solid"
								onClick={deleteProduct}
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										await deleteProduct();
									}
								}}
							>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</>
	);
};
