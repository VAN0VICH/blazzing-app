import type { SpaceID, SpaceRecord } from "@blazzing-app/validators";
import {
	createProduct,
	deleteProduct,
	updateProduct,
	publishProduct,
	copyProduct,
} from "./product";
import {
	createStore,
	deleteStoreImage,
	setActiveStoreID,
	updateStore,
} from "./store";
import { deleteAvatar, updateUser } from "./user";
import { createLineItem, deleteLineItem, updateLineItem } from "./line-item";
import { updateAddress } from "./address";
import { updateCart } from "./cart";
import { createOrder } from "./order";
import {
	assignOptionValueToVariant,
	deleteProductOptionValue,
	updateProductOptionValues,
} from "./product-option-value";
import {
	createProductOption,
	deleteProductOption,
	updateProductOption,
} from "./product-option";
import { createPrices, deletePrices, updatePrice } from "./price";
import {
	deleteVariant,
	duplicateVariant,
	updateVariant,
	generateVariants,
} from "./variant";
import { createCart } from "./carts";
import { deleteImage, updateImagesOrder, uploadImages } from "./image";
import { createPaymentProfile } from "./payment-profile";

const DashboardMutators = {
	createProduct,
	assignOptionValueToVariant,
	createProductOption,
	createPrices,
	generateVariants,
	deleteProduct,
	publishProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deletePrices,
	deleteVariant,
	duplicateVariant,
	updateProduct,
	copyProduct,
	updateProductOption,
	updateProductOptionValues,
	updatePrice,
	updateVariant,
	createStore,
	updateStore,
	createOrder,
	setActiveStoreID,
	deleteStoreImage,
	uploadImages,
	updateImagesOrder,
	deleteImage,
	createPaymentProfile,
};

export const DashboardMutatorsMap = new Map(Object.entries(DashboardMutators));
export type DashboardMutatorsType = typeof DashboardMutators;
export type DashboardMutatorsMapType = typeof DashboardMutatorsMap;
export const UserMutators = {
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
	deleteAvatar,
};
export const UserMutatorsMap = new Map(Object.entries(UserMutators));
export type UserMutatorsType = typeof UserMutators;
export type UserMutatorsMapType = typeof UserMutatorsMap;

export const StorefrontMutators = {
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
};

export const StorefrontMutatorsMap = new Map(
	Object.entries(StorefrontMutators),
);
export type StorefrontMutatorsType = typeof StorefrontMutators;
export type StorefrontMutatorsMapType = typeof StorefrontMutatorsMap;

type MutatorKeys =
	| keyof DashboardMutatorsType
	| keyof UserMutatorsType
	| keyof StorefrontMutatorsType;
//affected spaces and its subspaces
export type AffectedSpaces = Record<
	MutatorKeys,
	Partial<Record<SpaceID, SpaceRecord[SpaceID]>>
>;

export const affectedSpaces: AffectedSpaces = {
	createProduct: {
		dashboard: ["store"],
	},
	createProductOption: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	createPrices: {
		dashboard: ["store"],
	},
	generateVariants: {
		dashboard: ["store"],
	},
	deleteProduct: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	publishProduct: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
		storefront: ["products"],
	},
	copyProduct: {
		dashboard: ["store"],
	},
	deleteProductOption: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	deleteProductOptionValue: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	deletePrices: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	deleteVariant: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	duplicateVariant: {
		dashboard: ["store"],
	},
	updateProduct: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
		storefront: ["products"],
	},
	updateProductOption: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	updateProductOptionValues: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	updatePrice: {
		dashboard: ["store"],
		marketplace: ["stores"],
		storefront: ["products"],
	},
	updateVariant: {
		dashboard: ["store"],
		marketplace: ["stores"],
		global: ["cart"],
	},
	createStore: {
		dashboard: ["store"],
	},
	updateStore: {
		dashboard: ["store"],
		marketplace: ["stores"],
	},
	deleteStoreImage: {
		dashboard: ["store"],
		marketplace: ["stores"],
	},
	createOrder: {
		dashboard: ["store"],
	},
	updateUser: {
		global: ["user"],
	},
	assignOptionValueToVariant: {
		dashboard: ["store"],
	},
	createLineItem: {
		global: ["cart"],
		storefront: ["cart"],
	},
	updateLineItem: {
		global: ["cart"],
		storefront: ["cart"],
	},
	deleteLineItem: {
		global: ["cart"],
		storefront: ["cart"],
	},
	updateAddress: {
		global: ["cart"],
		storefront: ["cart"],
	},
	updateCart: {
		global: ["cart"],
		storefront: ["cart"],
	},
	setActiveStoreID: {
		dashboard: ["store"],
	},
	createCart: {
		global: ["cart"],
		storefront: ["cart"],
	},
	deleteImage: {
		dashboard: ["store"],
		marketplace: ["stores"],
	},
	updateImagesOrder: {
		dashboard: ["store"],
		marketplace: ["stores"],
	},
	uploadImages: {
		dashboard: ["store"],
		marketplace: ["stores"],
	},
	createPaymentProfile: {
		dashboard: ["store"],
	},
	deleteAvatar: {
		global: ["user"],
		marketplace: ["stores"],
	},
};
