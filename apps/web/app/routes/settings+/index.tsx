import { redirect, type LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
	return redirect("/settings/general");
};
