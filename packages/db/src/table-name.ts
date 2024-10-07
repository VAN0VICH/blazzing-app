/*TEMP FILE */

import type { TableName } from ".";
import {
	carts,
	collections,
	jsonTable,
	lineItems,
	prices,
	productOptions,
	productOptionValues,
	productOptionValuesToVariants,
	products,
	productsToTags,
	stores,
	tags,
	users,
	variants,
	addresses,
	orders,
	notifications,
	customers,
	paymentProfiles,
	stripe,
} from "./schema";

type UserTable = typeof users;

type ProductTable = typeof products;

type VariantTable = typeof variants;

type ProductOptionTable = typeof productOptions;

type ProductOptionValueTable = typeof productOptionValues;

type ProductCollectionTable = typeof collections;

type PriceTable = typeof prices;

type StoreTable = typeof stores;

type TagTable = typeof tags;

type ProductToTagTable = typeof productsToTags;

type ProductOptionValuesToVariantsTable = typeof productOptionValuesToVariants;

type CartTable = typeof carts;

type AddressTable = typeof addresses;

type LineItemTable = typeof lineItems;

type OrderTable = typeof orders;

type CustomerTable = typeof customers;

type NotificationTable = typeof notifications;

type PaymentProfileTable = typeof paymentProfiles;

type StripeTable = typeof stripe;
export type JsonTable = typeof jsonTable;
export type Table =
	| UserTable
	| ProductTable
	| VariantTable
	| ProductOptionTable
	| ProductOptionValueTable
	| ProductCollectionTable
	| PriceTable
	| StoreTable
	| TagTable
	| ProductToTagTable
	| ProductOptionValuesToVariantsTable
	| JsonTable
	| CartTable
	| LineItemTable
	| AddressTable
	| OrderTable
	| NotificationTable
	| CustomerTable
	| PaymentProfileTable
	| StripeTable;
export const tableNameToTableMap: Record<TableName, Table> = {
	users,
	products,
	variants,
	productOptions,
	productOptionValues,
	stores,
	collections,
	prices,
	tags,
	productsToTags,
	productOptionValuesToVariants,
	json: jsonTable,
	carts,
	lineItems,
	addresses,
	orders,
	notifications,
	customers,
	paymentProfiles,
	stripe,
};
export type TableNameToTableMap = typeof tableNameToTableMap;
