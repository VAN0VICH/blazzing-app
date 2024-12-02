// import { LiveKitRoom } from "@livekit/components-react";
// import { Box, Flex } from "@radix-ui/themes";
// import { useSearchParams } from "@remix-run/react";
// import { ClientOnly } from "remix-utils/client-only";
// import { Chat } from "~/components/templates/stream/chat";
// import { AuctionActions } from "~/components/templates/stream/auction-actions";
// import { StreamPlayer } from "~/components/templates/stream/stream-player";
// import { TokenContext } from "~/providers/token-context";
// import { type LoaderFunction, redirect, json } from "@remix-run/cloudflare";

// export const loader: LoaderFunction = ({ request }) => {
// 	const url = new URL(request.url);
// 	if (!url.searchParams.get("at") || !url.searchParams.get("rt")) {
// 		return redirect("/dashboard/auction");
// 	}
// 	return Response.json({});
// };

// export default function LiveAuctionStream() {
// 	const [searchParams] = useSearchParams();
// 	const authToken = searchParams.get("at")!;
// 	const roomToken = searchParams.get("rt")!;
// 	return (
// 		<TokenContext.Provider value={authToken}>
// 			<ClientOnly>
// 				{() => (
// 					<LiveKitRoom
// 						serverUrl={window.ENV.LIVEKIT_SERVER_URL}
// 						token={roomToken}
// 					>
// 						<Flex position="relative" width="100%">
// 							<Flex direction="column" className="flex-1" minHeight="1600px">
// 								<StreamPlayer isHost />
// 								<AuctionActions />
// 							</Flex>
// 							<Box className="min-w-[280px] hidden lg:block" />
// 							<Box className="dark:bg-accent-2 bg-gray-3 right-0 h-full fixed min-w-[280px] border-l dark:border-accent-5 border-accent-6 hidden lg:block">
// 								<Chat />
// 							</Box>
// 						</Flex>
// 					</LiveKitRoom>
// 				)}
// 			</ClientOnly>
// 		</TokenContext.Provider>
// 	);
// }
