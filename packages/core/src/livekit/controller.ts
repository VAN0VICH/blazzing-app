// import jwt from "jsonwebtoken";
// import {
// 	AccessToken,
// 	type CreateIngressOptions,
// 	IngressAudioEncodingPreset,
// 	IngressClient,
// 	type IngressInfo,
// 	IngressInput,
// 	IngressVideoEncodingPreset,
// 	type ParticipantInfo,
// 	type ParticipantPermission,
// 	RoomServiceClient,
// 	TrackSource,
// } from "livekit-server-sdk";

// export type RoomMetadata = {
// 	creatorIdentity: string;
// 	enableChat: boolean;
// 	allowParticipation: boolean;
// };

// export type ParticipantMetadata = {
// 	handRaised: boolean;
// 	invitedToStage: boolean;
// 	avatarImage: string;
// };

// export type Config = {
// 	wsUrl: string;
// 	apiKey: string;
// 	apiSecret: string;
// };

// export type Session = {
// 	identity: string;
// 	roomName: string;
// };

// export type ConnectionDetails = {
// 	token: string;
// 	wsUrl: string;
// };

// export type CreateIngressParams = {
// 	roomName?: string;
// 	ingressType: string;
// 	metadata: RoomMetadata;
// };

// export type CreateIngressResponse = {
// 	ingress: IngressInfo;
// 	authToken: string;
// 	connectionDetails: ConnectionDetails;
// };

// export type CreateStreamParams = {
// 	roomName?: string;
// 	metadata: RoomMetadata;
// };

// export type CreateStreamResponse = {
// 	authToken: string;
// 	connectionDetails: ConnectionDetails;
// };

// export type JoinStreamParams = {
// 	roomName: string;
// 	identity: string;
// };

// export type JoinStreamResponse = {
// 	authToken: string;
// 	connectionDetails: ConnectionDetails;
// };

// export type InviteToStageParams = {
// 	identity: string;
// };

// export type RemoveFromStageParams = {
// 	identity?: string;
// };

// export type ErrorResponse = {
// 	error: string;
// };

// export function getSessionFromReq(req: Request, apiSecret: string): Session {
// 	const authHeader = req.headers.get("authorization");
// 	const token = authHeader?.split(" ")[1];
// 	if (!token) {
// 		throw new Error("No authorization header found");
// 	}
// 	const verified = jwt.verify(token, apiSecret);
// 	if (!verified) {
// 		throw new Error("Invalid token");
// 	}
// 	const decoded = jwt.decode(token) as Session;
// 	return decoded;
// }

// export class Controller {
// 	private ingressService: IngressClient;
// 	private roomService: RoomServiceClient;
// 	private serverURL: string;
// 	private apiKey: string;
// 	private apiSecret: string;

// 	constructor(serverURL: string, apiKey: string, apiSecret: string) {
// 		const httpUrl = serverURL
// 			.replace("wss://", "https://")
// 			.replace("ws://", "http://");
// 		this.ingressService = new IngressClient(httpUrl);
// 		this.roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
// 		this.serverURL = serverURL;
// 		this.apiKey = apiKey;
// 		this.apiSecret = apiSecret;
// 	}

// 	async createIngress({
// 		metadata,
// 		roomName,
// 		ingressType = "rtmp",
// 	}: CreateIngressParams): Promise<CreateIngressResponse> {
// 		if (!roomName) {
// 			roomName = generateRoomId();
// 		}

// 		await this.roomService.createRoom({
// 			name: roomName,
// 			metadata: JSON.stringify(metadata),
// 		});

// 		const options: CreateIngressOptions = {
// 			name: roomName,
// 			roomName: roomName,
// 			participantName: `${metadata.creatorIdentity} (via OBS)`,
// 			participantIdentity: `${metadata.creatorIdentity} (via OBS)`,
// 		};

// 		if (ingressType === "whip") {
// 			options.bypassTranscoding = true;
// 		} else {
// 			options.video = {
// 				source: TrackSource.CAMERA,
// 				//@ts-ignore
// 				preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
// 			};
// 			options.audio = {
// 				source: TrackSource.MICROPHONE,
// 				//@ts-ignore
// 				preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
// 			};
// 		}

// 		const ingress = await this.ingressService.createIngress(
// 			ingressType === "whip"
// 				? IngressInput.WHIP_INPUT
// 				: IngressInput.RTMP_INPUT,
// 			options,
// 		);

// 		const at = new AccessToken(this.apiKey, this.apiSecret, {
// 			identity: metadata.creatorIdentity,
// 		});

// 		at.addGrant({
// 			room: roomName,
// 			roomJoin: true,
// 			canPublish: false,
// 			canSubscribe: true,
// 			canPublishData: true,
// 		});

// 		const authToken = this.createAuthToken(roomName, metadata.creatorIdentity);

// 		return {
// 			ingress,
// 			authToken: authToken,
// 			connectionDetails: {
// 				wsUrl: this.serverURL,
// 				token: await at.toJwt(),
// 			},
// 		};
// 	}

// 	async createStream({
// 		metadata,
// 		roomName,
// 	}: CreateStreamParams): Promise<CreateStreamResponse> {
// 		const at = new AccessToken(this.apiKey, this.apiSecret, {
// 			identity: metadata.creatorIdentity,
// 		});

// 		if (!roomName) {
// 			roomName = generateRoomId();
// 		}
// 		at.addGrant({
// 			room: roomName,
// 			roomJoin: true,
// 			canPublish: true,
// 			canSubscribe: true,
// 		});

// 		await this.roomService.createRoom({
// 			name: roomName,
// 			metadata: JSON.stringify(metadata),
// 		});

// 		const connectionDetails = {
// 			wsUrl: this.serverURL,
// 			token: await at.toJwt(),
// 		};

// 		const authToken = this.createAuthToken(roomName, metadata.creatorIdentity);

// 		return {
// 			authToken: authToken,
// 			connectionDetails,
// 		};
// 	}

// 	async stopStream(session: Session) {
// 		const rooms = await this.roomService.listRooms([session.roomName]);

// 		if (rooms.length === 0) {
// 			throw new Error("Room does not exist");
// 		}

// 		const room = rooms[0];
// 		const creatorIdentity = (JSON.parse(room!.metadata) as RoomMetadata)
// 			.creatorIdentity;

// 		if (creatorIdentity !== session.identity) {
// 			throw new Error("Only the creator can invite to stage");
// 		}

// 		await this.roomService.deleteRoom(session.roomName);
// 	}

// 	async joinStream({
// 		identity,
// 		roomName,
// 	}: JoinStreamParams): Promise<JoinStreamResponse> {
// 		let exists = false;
// 		try {
// 			await this.roomService.getParticipant(roomName, identity);
// 			exists = true;
// 		} catch {}

// 		if (exists) {
// 			throw new Error("Participant already exists");
// 		}

// 		const at = new AccessToken(this.apiKey, this.apiSecret, {
// 			identity,
// 		});

// 		at.addGrant({
// 			room: roomName,
// 			roomJoin: true,
// 			canPublish: false,
// 			canSubscribe: true,
// 			canPublishData: true,
// 		});

// 		const authToken = this.createAuthToken(roomName, identity);

// 		return {
// 			authToken: authToken,
// 			connectionDetails: {
// 				wsUrl: this.serverURL,
// 				token: await at.toJwt(),
// 			},
// 		};
// 	}

// 	async inviteToStage(session: Session, { identity }: InviteToStageParams) {
// 		const rooms = await this.roomService.listRooms([session.roomName]);

// 		if (rooms.length === 0) {
// 			throw new Error("Room does not exist");
// 		}

// 		const room = rooms[0];
// 		const creatorIdentity = (JSON.parse(room!.metadata) as RoomMetadata)
// 			.creatorIdentity;

// 		if (creatorIdentity !== session.identity) {
// 			throw new Error("Only the creator can invite to stage");
// 		}

// 		const participant = await this.roomService.getParticipant(
// 			session.roomName,
// 			identity,
// 		);
// 		const permission = participant.permission || ({} as ParticipantPermission);

// 		const metadata = this.getOrCreateParticipantMetadata(participant);
// 		metadata.invitedToStage = true;

// 		if (metadata.handRaised) {
// 			permission.canPublish = true;
// 		}

// 		await this.roomService.updateParticipant(
// 			session.roomName,
// 			identity,
// 			JSON.stringify(metadata),
// 			permission,
// 		);
// 	}

// 	async removeFromStage(session: Session, { identity }: RemoveFromStageParams) {
// 		if (!identity) {
// 			identity = session.identity;
// 		}

// 		const rooms = await this.roomService.listRooms([session.roomName]);

// 		if (rooms.length === 0) {
// 			throw new Error("Room does not exist");
// 		}

// 		const room = rooms[0];
// 		const creatorIdentity = (JSON.parse(room!.metadata) as RoomMetadata)
// 			.creatorIdentity;

// 		if (creatorIdentity !== session.identity && identity !== session.identity) {
// 			throw new Error(
// 				"Only the creator or the participant him self can remove from stage",
// 			);
// 		}

// 		const participant = await this.roomService.getParticipant(
// 			session.roomName,
// 			session.identity,
// 		);

// 		const permission = participant.permission || ({} as ParticipantPermission);
// 		const metadata = this.getOrCreateParticipantMetadata(participant);

// 		metadata.handRaised = false;
// 		metadata.invitedToStage = false;
// 		permission.canPublish = false;

// 		await this.roomService.updateParticipant(
// 			session.roomName,
// 			identity,
// 			JSON.stringify(metadata),
// 			permission,
// 		);
// 	}

// 	async raiseHand(session: Session) {
// 		const participant = await this.roomService.getParticipant(
// 			session.roomName,
// 			session.identity,
// 		);

// 		const permission = participant.permission || ({} as ParticipantPermission);
// 		const metadata = this.getOrCreateParticipantMetadata(participant);
// 		metadata.handRaised = true;

// 		if (metadata.invitedToStage) {
// 			permission.canPublish = true;
// 		}

// 		await this.roomService.updateParticipant(
// 			session.roomName,
// 			session.identity,
// 			JSON.stringify(metadata),
// 			permission,
// 		);
// 	}

// 	getOrCreateParticipantMetadata(
// 		participant: ParticipantInfo,
// 	): ParticipantMetadata {
// 		if (participant.metadata) {
// 			return JSON.parse(participant.metadata) as ParticipantMetadata;
// 		}
// 		return {
// 			handRaised: false,
// 			invitedToStage: false,
// 			avatarImage: `https://api.multiavatar.com/${participant.identity}.png`,
// 		};
// 	}
// 	createAuthToken(roomName: string, identity: string) {
// 		return jwt.sign(JSON.stringify({ roomName, identity }), this.apiSecret);
// 	}
// }

// function generateRoomId(): string {
// 	return `${randomString(4)}-${randomString(4)}`;
// }

// function randomString(length: number): string {
// 	let result = "";
// 	const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
// 	const charactersLength = characters.length;
// 	for (let i = 0; i < length; i++) {
// 		result += characters.charAt(Math.floor(Math.random() * charactersLength));
// 	}
// 	return result;
// }
