import type { WriteTransaction } from "replicache";

import type { Server } from "..";
import { updateAddress } from "./address";
import { addAdmin, removeAdmin } from "./admin";
import { createCart, updateCart } from "./cart";
import { deleteImage, updateImagesOrder, uploadImages } from "./image";
import { createLineItem, deleteLineItem, updateLineItem } from "./line-item";
import { createOrder, deleteOrder, updateOrder } from "./order";
import { createPrices, deletePrices, updatePrice } from "./price";
import {
	copyProduct,
	createProduct,
	deleteProduct,
	publishProduct,
	updateProduct,
} from "./product";
import {
	createProductOption,
	deleteProductOption,
	updateProductOption,
} from "./product-option";
import {
	assignOptionValueToVariant,
	deleteProductOptionValue,
	updateProductOptionValues,
} from "./product-option-value";
import {
	createStore,
	deleteStoreImage,
	setActiveStoreID,
	updateStore,
} from "./store";
import { deleteAvatar, updateUser } from "./user";
import {
	deleteVariant,
	duplicateVariant,
	generateVariants,
	updateVariant,
} from "./variant";

export type DashboardMutatorsType = {
	[key in keyof Server.DashboardMutatorsType]: (
		tx: WriteTransaction,
		args: Parameters<Server.DashboardMutatorsType[key]>[0],
	) => Promise<void>;
};
export const DashboardMutators: DashboardMutatorsType = {
	createProduct,
	updateProduct,
	deleteProduct,
	publishProduct,
	copyProduct,
	createProductOption,
	updateProductOption,
	deleteProductOption,
	assignOptionValueToVariant,
	createPrices,
	deletePrices,
	generateVariants,
	updateVariant,
	deleteVariant,
	duplicateVariant,
	deleteProductOptionValue,
	updateProductOptionValues,
	updatePrice,
	createStore,
	updateStore,
	createOrder,
	deleteStoreImage,
	setActiveStoreID,
	updateImagesOrder,
	deleteImage,
	uploadImages,
	addAdmin,
	removeAdmin,
};
export type GlobalMutatorsType = {
	[key in keyof Server.UserMutatorsType]: (
		ctx: WriteTransaction,
		args: Parameters<Server.UserMutatorsType[key]>[0],
	) => Promise<void>;
};
export const GlobalMutators: GlobalMutatorsType = {
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
	deleteAvatar,
};

export type StorefrontMutatorsType = {
	[key in keyof Server.StorefrontMutatorsType]: (
		ctx: WriteTransaction,
		args: Parameters<Server.StorefrontMutatorsType[key]>[0],
	) => Promise<void>;
};
export const StorefrontMutators: StorefrontMutatorsType = {
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
};

export type StorefrontDashboardMutatorsType = {
	[key in keyof Server.StorefrontDashboardMutatorsType]: (
		ctx: WriteTransaction,
		args: Parameters<Server.StorefrontDashboardMutatorsType[key]>[0],
	) => Promise<void>;
};
export const StorefrontDashboardMutators: StorefrontDashboardMutatorsType = {
	createLineItem,
	createOrder,
	deleteLineItem,
	updateAddress,
	updateLineItem,
	updateOrder,
	deleteOrder,
	updateProduct,
};
