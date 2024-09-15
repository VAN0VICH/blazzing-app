import { LiveKitRoom } from "@livekit/components-react";
import { Box, Flex } from "@radix-ui/themes";
import { useSearchParams } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { Chat } from "~/components/templates/stream/chat";
import { AuctionActions } from "~/components/templates/stream/auction-actions";
import { StreamPlayer } from "~/components/templates/stream/stream-player";
import { TokenContext } from "~/providers/token-context";

// export const loader: LoaderFunction = ({ request }) => {
// 	const url = new URL(request.url);
// 	if (!url.searchParams.get("at") || !url.searchParams.get("rt")) {
// 		return redirect("/dashboard/auction");
// 	}
// 	return json({});
// };

export default function LiveAuctionStream() {
	const [searchParams] = useSearchParams();
	const authToken = searchParams.get("at")!;
	const roomToken = searchParams.get("rt")!;
	return (
		<TokenContext.Provider value={authToken}>
			<ClientOnly>
				{() => (
					<LiveKitRoom
						serverUrl={window.ENV.LIVEKIT_SERVER_URL}
						token={roomToken}
					>
						<Flex
							width="100%"
							height={{
								initial: "calc(100vh - 85px)",
								md: "calc(100vh - 55px)",
							}}
						>
							<Flex direction="column" className="flex-1">
								<Box className="flex-1">
									<StreamPlayer isHost />
								</Box>
								<AuctionActions />
							</Flex>
							<Box className="dark:bg-accent-2 bg-gray-3 min-w-[280px] border-l dark:border-accent-5 border-accent-6 hidden lg:block">
								<Chat />
							</Box>
						</Flex>
					</LiveKitRoom>
				)}
			</ClientOnly>
		</TokenContext.Provider>
	);
}
