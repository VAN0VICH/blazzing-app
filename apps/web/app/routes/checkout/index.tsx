import { DesktopCheckout } from "./components/desktop";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { userContext } from "~/server/sessions.server";

type LoaderData = {
	cartID: string | undefined;
	tempUserID: string | undefined;
};
export const loader: LoaderFunction = async (args) => {
	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext?.parse(cookieHeader)) || {};

	return Response.json({
		cartID: userContextCookie.cartID,
		tempUserID: userContextCookie.tempUserID,
	});
};

export default function Checkout() {
	const { cartID, tempUserID } = useLoaderData<LoaderData>();
	return (
		<SidebarLayoutWrapper>
			<ClientOnly>
				{() => (
					<DesktopCheckout cartID={cartID ?? ""} tempUserID={tempUserID} />
				)}
			</ClientOnly>
		</SidebarLayoutWrapper>
	);
}
