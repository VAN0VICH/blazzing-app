// import type { Livekit } from "@blazzing-app/core";
// import type { Routes } from "@blazzing-app/functions";
// import {
// 	AudioTrack,
// 	StartAudio,
// 	VideoTrack,
// 	useDataChannel,
// 	useLocalParticipant,
// 	useMediaDeviceSelect,
// 	useParticipants,
// 	useRoomContext,
// 	useTracks,
// } from "@livekit/components-react";
// import { CopyIcon, EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
// import { Avatar, Badge, Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
// import { useCopyToClipboard } from "@uidotdev/usehooks";
// import { hc } from "hono/client";
// import Confetti from "js-confetti";
// import {
// 	ConnectionState,
// 	type LocalVideoTrack,
// 	Track,
// 	createLocalTracks,
// } from "livekit-client";
// import React, { useEffect, useRef, useState } from "react";
// import { useAuthToken } from "~/providers/token-context";
// import { MediaDeviceSettings } from "./media-device-settings";
// import { PresenceDialog } from "./presence-dialog";

// function ConfettiCanvas() {
// 	const [confetti, setConfetti] = useState<Confetti>();
// 	const [decoder] = useState(() => new TextDecoder());
// 	const canvasEl = useRef<HTMLCanvasElement>(null);
// 	useDataChannel("reactions", (data) => {
// 		const options: { emojis?: string[]; confettiNumber?: number } = {};

// 		if (decoder.decode(data.payload) !== "🎉") {
// 			options.emojis = [decoder.decode(data.payload)];
// 			options.confettiNumber = 12;
// 		}

// 		confetti?.addConfetti(options);
// 	});

// 	useEffect(() => {
// 		setConfetti(new Confetti({ canvas: canvasEl?.current! }));
// 	}, []);

// 	return <canvas ref={canvasEl} className="absolute h-full w-full" />;
// }

// export function StreamPlayer({ isHost = false }) {
// 	const [_, copy] = useCopyToClipboard();

// 	const [honoClient] = React.useState(() => hc<Routes>(window.ENV.WORKER_URL));

// 	const [localVideoTrack, setLocalVideoTrack] =
// 		React.useState<LocalVideoTrack>();
// 	const localVideoEl = useRef<HTMLVideoElement>(null);

// 	const { metadata, name: roomName, state: roomState } = useRoomContext();
// 	const roomMetadata = (metadata &&
// 		JSON.parse(metadata)) as Livekit.RoomMetadata;
// 	const { localParticipant } = useLocalParticipant();
// 	const localMetadata = (localParticipant.metadata &&
// 		JSON.parse(localParticipant.metadata)) as Livekit.ParticipantMetadata;
// 	const canHost =
// 		isHost || (localMetadata?.invitedToStage && localMetadata?.handRaised);
// 	const participants = useParticipants();
// 	const showNotification = isHost
// 		? participants.some((p) => {
// 				const metadata = (p.metadata &&
// 					JSON.parse(p.metadata)) as Livekit.ParticipantMetadata;
// 				return metadata?.handRaised && !metadata?.invitedToStage;
// 			})
// 		: localMetadata?.invitedToStage && !localMetadata?.handRaised;

// 	useEffect(() => {
// 		if (canHost) {
// 			const createTracks = async () => {
// 				const tracks = await createLocalTracks({ audio: true, video: true });
// 				const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
// 				if (camTrack && localVideoEl?.current) {
// 					camTrack.attach(localVideoEl.current);
// 				}
// 				setLocalVideoTrack(camTrack as LocalVideoTrack);
// 			};
// 			void createTracks();
// 		}
// 	}, [canHost]);

// 	const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
// 		kind: "videoinput",
// 	});

// 	useEffect(() => {
// 		if (localVideoTrack) {
// 			void localVideoTrack.setDeviceId(activeCameraDeviceId);
// 		}
// 	}, [localVideoTrack, activeCameraDeviceId]);

// 	const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
// 		(t) => t.participant.identity !== localParticipant.identity,
// 	);

// 	const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
// 		(t) => t.participant.identity !== localParticipant.identity,
// 	);

// 	const authToken = useAuthToken();
// 	const onLeaveStage = async () => {
// 		await honoClient.auction["remove-from-stage"].$post(
// 			{
// 				json: {
// 					identity: localParticipant.identity,
// 				},
// 			},
// 			{
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Token ${authToken}`,
// 				},
// 			},
// 		);
// 	};

// 	return (
// 		<Box
// 			position="relative"
// 			width="100%"
// 			maxHeight="800px"
// 			className="bg-black md:min-h-[700px]"
// 		>
// 			<Grid className="w-full h-full absolute" gap="2">
// 				{canHost && (
// 					<div className="relative">
// 						<Flex
// 							className="absolute w-full h-full"
// 							align="center"
// 							justify="center"
// 						>
// 							<Avatar
// 								size="9"
// 								fallback={localParticipant.identity[0] ?? "?"}
// 								radius="full"
// 							/>
// 						</Flex>
// 						{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
// 						<video
// 							ref={localVideoEl}
// 							className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
// 						/>
// 						<div className="absolute w-full h-full">
// 							<Badge
// 								variant="outline"
// 								color="gray"
// 								className="absolute bottom-2 right-2"
// 							>
// 								{localParticipant.identity} (you)
// 							</Badge>
// 						</div>
// 					</div>
// 				)}
// 				{remoteVideoTracks.map((t) => (
// 					<div key={t.participant.identity} className="relative">
// 						<Flex
// 							className="absolute w-full h-full"
// 							align="center"
// 							justify="center"
// 						>
// 							<Avatar
// 								size="9"
// 								fallback={t.participant.identity[0] ?? "?"}
// 								radius="full"
// 							/>
// 						</Flex>
// 						<VideoTrack
// 							trackRef={t}
// 							className="absolute w-full h-full bg-transparent"
// 						/>
// 						<div className="absolute w-full h-full">
// 							<Badge
// 								variant="outline"
// 								color="gray"
// 								className="absolute bottom-2 right-2"
// 							>
// 								{t.participant.identity}
// 							</Badge>
// 						</div>
// 					</div>
// 				))}
// 			</Grid>
// 			{remoteAudioTracks.map((t) => (
// 				<AudioTrack trackRef={t} key={t.participant.identity} />
// 			))}
// 			<ConfettiCanvas />
// 			<StartAudio
// 				label="Click to allow audio playback"
// 				className="absolute top-0 h-full w-full bg-gray-2-translucent text-white"
// 			/>
// 			<div className="absolute top-0 w-full p-2">
// 				<Flex justify="between" align="end">
// 					<Flex gap="2" justify="center" align="center">
// 						<Button
// 							size="1"
// 							variant="soft"
// 							disabled={!roomName}
// 							onClick={() =>
// 								copy(`${process.env.NEXT_PUBLIC_SITE_URL}/watch/${roomName}`)
// 							}
// 						>
// 							{roomState === ConnectionState.Connected ? (
// 								<>
// 									{roomName} <CopyIcon />
// 								</>
// 							) : (
// 								"Loading..."
// 							)}
// 						</Button>
// 						{roomName && canHost && (
// 							<Flex gap="2">
// 								<MediaDeviceSettings />
// 								{roomMetadata?.creatorIdentity !==
// 									localParticipant.identity && (
// 									<Button size="1" onClick={onLeaveStage}>
// 										Leave stage
// 									</Button>
// 								)}
// 							</Flex>
// 						)}
// 					</Flex>
// 					<Flex gap="2">
// 						{roomState === ConnectionState.Connected && (
// 							<Flex gap="1" align="center">
// 								<div className="rounded-6 bg-red-9 w-2 h-2 animate-pulse" />
// 								<Text size="1" className="uppercase text-accent-11">
// 									Live
// 								</Text>
// 							</Flex>
// 						)}
// 						<PresenceDialog isHost={isHost}>
// 							<div className="relative">
// 								{showNotification && (
// 									<div className="absolute flex h-3 w-3 -top-1 -right-1">
// 										<span className="animate-ping absolute inline-flex h-full w-full rounded-6 bg-accent-11 opacity-75" />
// 										<span className="relative inline-flex rounded-6 h-3 w-3 bg-accent-11" />
// 									</div>
// 								)}
// 								<Button
// 									size="1"
// 									variant="soft"
// 									disabled={roomState !== ConnectionState.Connected}
// 								>
// 									{roomState === ConnectionState.Connected ? (
// 										<EyeOpenIcon />
// 									) : (
// 										<EyeClosedIcon />
// 									)}
// 									{roomState === ConnectionState.Connected
// 										? participants.length
// 										: ""}
// 								</Button>
// 							</div>
// 						</PresenceDialog>
// 					</Flex>
// 				</Flex>
// 			</div>
// 		</Box>
// 	);
// }
