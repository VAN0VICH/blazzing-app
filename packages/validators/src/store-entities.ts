// TYPE DEFINITIONS FOR CLIENT.
import type { AccountBalance } from "./balance";
import type { Server } from "./entities";
export type Variant = Server.Variant & {
	product?: Product;
	prices?: Server.Price[];
	optionValues?: Array<{
		optionValue: StoreProductOptionValue & { option: StoreProductOption };
	}>;
	images: string[];
};
export type StoreVariant = Variant & {
	product: StoreProduct;
	prices: StorePrice[];
	optionValues: StoreProductOptionValue[];

	images: string[];
};

export type Product = Server.Product & {
	variants?: Variant[];
	options?: StoreProductOption[];
	collection: Server.Collection;
	baseVariant: Variant;
	store: Server.Store;
};
export type StoreProduct = Product & {
	variants: StoreVariant[];
	options: StoreProductOption[];
	collection: Server.Collection;
	baseVariant: StoreVariant;
};

export type StoreProductOption = Server.ProductOption & {
	optionValues?: StoreProductOptionValue[];
};
export type Store = Server.Store & {
	products?: (Product | StoreProduct)[];
	owner?: Server.User;
	paymentProfiles?: StorePaymentProfile[];
	admins?: {
		admin: {
			email: string;
		};
	}[];
};
export type StorePrice = Server.Price;
export type StoreProductOptionValue = Server.ProductOptionValue & {
	option: StoreProductOption;
};
export type StoreUser = Server.User;
export type StoreCustomer = Server.Customer & {
	user?: StoreUser;
};
export type StoreAddress = Server.Address;
export type StoreLineItem = Server.LineItem & {
	variant: StoreVariant;
	product?: StoreProduct;
};

export type StoreCart = Server.Cart & {
	shippingAddress?: StoreAddress;
	billingAddress?: StoreAddress;
};

export type StoreOrder = Server.Order & {
	customer?: StoreCustomer;
	shippingAddress?: StoreAddress;
	billingAddress?: StoreAddress;
	store?: Store;
	items: StoreLineItem[];
};
export type StoreNotification = Server.Notification;
export type StorePaymentProfile = Server.PaymentProfile & {
	stripe?: StoreStripeAccount & {
		balance?: AccountBalance;
	};
};
export type StoreStripeAccount = Server.StripeAccount;
