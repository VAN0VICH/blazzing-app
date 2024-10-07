import { Clock, Effect, Layer } from "effect";

import { schema, tableNameToTableMap, type Db } from "@blazzing-app/db";
import { AuthContext, Database } from "@blazzing-app/shared";
import {
	MutatorNotFoundError,
	NeonDatabaseError,
	type Mutation,
	type PushRequest,
	type ReplicacheClient,
	type SpaceID,
	type SpaceRecord,
} from "@blazzing-app/validators";

import { entries } from "remeda";
import { ReplicacheContext } from "./context";
import { TableMutator } from "./context/table-mutator";
import {
	DashboardMutatorsMap,
	UserMutators,
	UserMutatorsMap,
	affectedSpaces,
	type AffectedSpaces,
	type DashboardMutatorsMapType,
	type UserMutatorsMapType,
} from "./mutators/server";

const publicMutators = new Set(Object.keys(UserMutators));

export const push = ({
	body: push,
	db,
	partyKitOrigin,
}: {
	body: PushRequest;
	db: Db;
	partyKitOrigin: string;
}) =>
	Effect.gen(function* () {
		yield* Effect.log("----------------------------------------------------");

		yield* Effect.log(`PROCESSING PUSH: ${JSON.stringify(push, null, "")}`);
		const { spaceID } = yield* ReplicacheContext;
		const { authUser } = yield* AuthContext;

		const startTime = yield* Clock.currentTimeMillis;
		const mutators =
			spaceID === "dashboard" ? DashboardMutatorsMap : UserMutatorsMap;

		const affectedSpacesMap = new Map<
			SpaceID,
			Set<SpaceRecord[SpaceID][number]>
		>();

		yield* Effect.forEach(push.mutations, (mutation) =>
			Effect.gen(function* () {
				if (!authUser && !publicMutators.has(mutation.name)) return;
				// 1: START TRANSACTION FOR EACH MUTATION
				const mutationEffect = yield* Effect.tryPromise(() =>
					db.transaction(
						async (transaction) =>
							Effect.gen(function* () {
								const DatabaseLive = Layer.succeed(
									Database,
									Database.of({
										manager: transaction,
										tableNameToTableMap,
									}),
								);

								// 2: GET CLIENT ROW
								const baseClient =
									(yield* Effect.tryPromise(() =>
										transaction.query.replicacheClients.findFirst({
											where: (clients, { eq }) =>
												eq(clients.id, mutation.clientID),
										}),
									).pipe(
										Effect.catchTags({
											UnknownException: (error) =>
												new NeonDatabaseError({
													message: error.message,
												}),
										}),
									)) ??
									({
										id: mutation.clientID,
										lastMutationID: 0,
										clientGroupID: push.clientGroupID,
										version: 0,
									} satisfies ReplicacheClient);

								let updated = false;

								const mutationContext = TableMutator.Live.pipe(
									Layer.provide(DatabaseLive),
								);

								// 3: PROCESS MUTATION
								const nextMutationID = yield* processMutation({
									lastMutationID: baseClient.lastMutationID,
									mutation,
									mutators,
									affectedSpacesMap,
								}).pipe(
									Effect.provide(mutationContext),
									Effect.provide(DatabaseLive),
								);

								if (baseClient.lastMutationID < nextMutationID) {
									updated = true;
								}

								if (updated) {
									yield* Effect.log("updating client");
									yield* Effect.tryPromise(() =>
										transaction
											.insert(schema.replicacheClients)
											//@ts-ignore
											.values({
												clientGroupID: push.clientGroupID,
												id: mutation.clientID,
												lastMutationID: nextMutationID,
											})
											.onConflictDoUpdate({
												target: schema.replicacheClients.id,
												set: {
													lastMutationID: nextMutationID,
												},
											}),
									).pipe(
										Effect.catchTags({
											UnknownException: (error) =>
												new NeonDatabaseError({
													message: error.message,
												}),
										}),
									);
								} else {
									yield* Effect.log("Nothing to update");
								}
							}),
						{ isolationLevel: "repeatable read", accessMode: "read write" },
					),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({
								message: error.message,
							}),
					}),
				);
				yield* mutationEffect;
			}),
		);

		// 4: SEND POKE, OR TRIGGER PULL FROM THE CLIENT
		yield* Effect.forEach(
			Array.from(affectedSpacesMap.entries()),
			([spaceID, subspaceIDs]) =>
				Effect.tryPromise(() =>
					fetch(`${partyKitOrigin}/parties/main/${spaceID}`, {
						method: "POST",
						body: JSON.stringify(Array.from(subspaceIDs)),
					}),
				).pipe(Effect.retry({ times: 3 })),
			{ concurrency: "unbounded" },
		);

		const endTime = yield* Clock.currentTimeMillis;
		yield* Effect.log(`Processed all mutations in ${endTime - startTime}`);
	});

const processMutation = ({
	mutation,
	lastMutationID,
	mutators,
	affectedSpacesMap,
}: {
	mutation: Mutation;
	lastMutationID: number;
	mutators: DashboardMutatorsMapType | UserMutatorsMapType;
	affectedSpacesMap: Map<SpaceID, Set<SpaceRecord[SpaceID][number]>>;
}) =>
	Effect.gen(function* () {
		const expectedMutationID = lastMutationID + 1;

		if (mutation.id < expectedMutationID) {
			yield* Effect.log(
				`Mutation ${mutation.id} has already been processed - skipping`,
			);

			return lastMutationID;
		}

		if (mutation.id > expectedMutationID) {
			yield* Effect.logWarning(
				`Mutation ${mutation.id} is from the future - aborting`,
			);

			return lastMutationID;
		}

		yield* Effect.log(
			`Processing mutation: ${JSON.stringify(mutation, null, "")}`,
		);

		const start = yield* Clock.currentTimeMillis;

		const { name, args } = mutation;

		const mutator = mutators.get(name);

		if (!mutator) {
			yield* Effect.fail(
				new MutatorNotFoundError({
					message: `No mutator found for ${name}`,
				}),
			);

			return lastMutationID;
		}

		//@ts-ignore
		yield* mutator(args).pipe(
			Effect.catchTags({
				AuthorizationError: () =>
					Effect.sync(() => {
						console.log("auth error");
					}),
				ImageUploadError: () =>
					Effect.sync(() => {
						console.log("image upload error");
					}),
			}),
			Effect.orDie,
		);

		const affectedSpace = affectedSpaces[name as keyof AffectedSpaces];
		if (!affectedSpace) {
			yield* Effect.fail(
				new MutatorNotFoundError({
					message: `You forgot to add a mutator ${name} to affected space `,
				}),
			);
		}
		yield* Effect.forEach(entries(affectedSpace), ([spaceID, subspaceIDs]) =>
			Effect.gen(function* () {
				const subspaces = affectedSpacesMap.get(spaceID) ?? new Set();
				yield* Effect.forEach(
					subspaceIDs,
					(subspaceID) => Effect.sync(() => subspaces.add(subspaceID)),
					{ concurrency: "unbounded" },
				);
				affectedSpacesMap.set(spaceID, subspaces);
			}),
		);

		const end = yield* Clock.currentTimeMillis;

		yield* Effect.log(`Processed mutation in ${end - start}`);

		return expectedMutationID;
	});
