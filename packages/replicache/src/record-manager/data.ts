import { eq, inArray } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { isDefined, keys, mapToObj } from "remeda";
import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import { schema, type TableName } from "@blazzing-app/db";

import type { ExtractEffectValue } from "@blazzing-app/utils";
import {
	InvalidValue,
	NeonDatabaseError,
	SPACE_RECORD,
	type ClientGroupObject,
	type ClientViewRecord,
	type ReplicacheClient,
	type ReplicacheSubspaceRecord,
	type RowsWTableName,
	type SpaceID,
	type SpaceRecord,
} from "@blazzing-app/validators";

import {
	type AuthContext,
	Database,
	type Cloudflare,
} from "@blazzing-app/shared";

import { ReplicacheContext } from "../context";
import { SpaceRecordGetter, fullRowsGetter } from "./space/getter";

interface SpaceRecordDiff {
	newIDs: Map<TableName, Set<string>>;
	deletedIDs: string[];
}

type SubspaceRecord = Omit<ReplicacheSubspaceRecord, "version">;

type ClientRecordDiff = Record<string, number>;

export const makeClientViewRecord = (
	data: RowsWTableName[],
): Record<string, number> => {
	const clientViewRecord: Record<string, number> = {};

	for (const { rows } of data) {
		for (const row of rows) {
			clientViewRecord[row.id] = row.version;
		}
	}

	return clientViewRecord;
};

export const getRowsWTableName = <T extends SpaceID>({
	spaceID,
	fullRows,
	subspaceID,
}: {
	fullRows: boolean;
	spaceID: T;
	subspaceID: SpaceRecord[T][number];
}): Effect.Effect<
	RowsWTableName[],
	InvalidValue | NeonDatabaseError,
	Cloudflare | ReplicacheContext | Database | AuthContext
> => {
	const getRowsWTableName = SpaceRecordGetter[spaceID][subspaceID];
	if (getRowsWTableName) {
		return getRowsWTableName({
			fullRows,
		});
	}

	return Effect.fail(
		new InvalidValue({
			message: "Invalid spaceID or subspaceID",
		}),
	);
};

const getOldSpaceRecord = ({
	key,
}: {
	key: string | undefined;
}): Effect.Effect<
	Array<SubspaceRecord> | undefined,
	NeonDatabaseError,
	ReplicacheContext | Database
> => {
	return Effect.gen(function* () {
		const { spaceID, subspaceIDs } = yield* ReplicacheContext;
		const { manager } = yield* Database;
		if (!key) return undefined;
		const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

		const result = yield* pipe(
			Effect.tryPromise(() =>
				manager.query.replicacheSubspaceRecords.findMany({
					columns: {
						id: true,
						subspaceID: true,
						record: true,
					},
					where: ({ subspaceID, id }, { inArray, eq, and }) =>
						//@ts-ignore
						and(eq(id, key), inArray(subspaceID, subIDs)),
				}),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		if (result.length === 0) return undefined;
		return result;
	});
};

const getNewSpaceRecord = ({
	newSpaceRecordKey,
}: {
	newSpaceRecordKey: string;
}): Effect.Effect<
	Array<{
		rows: Array<RowsWTableName>;
		subspaceRecord: SubspaceRecord;
	}>,
	InvalidValue | NeonDatabaseError,
	Cloudflare | Database | ReplicacheContext | AuthContext
> => {
	return Effect.gen(function* () {
		const { spaceID, subspaceIDs } = yield* ReplicacheContext;

		const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

		return yield* Effect.forEach(
			subIDs,
			(subspaceID) =>
				pipe(
					getRowsWTableName({
						spaceID,
						subspaceID,
						fullRows: false,
					}),
					Effect.map((rows) => ({
						rows,
						subspaceRecord: {
							id: newSpaceRecordKey,
							subspaceID,
							record: makeClientViewRecord(rows),
						},
					})),
				),

			{
				concurrency: "unbounded",
			},
		);
	});
};

const diffSpaceRecords = ({
	currentRecord,
	prevRecord,
}: {
	prevRecord: ExtractEffectValue<ReturnType<typeof getOldSpaceRecord>>;
	currentRecord: ExtractEffectValue<ReturnType<typeof getNewSpaceRecord>>;
}): Effect.Effect<SpaceRecordDiff, never, never> => {
	return Effect.gen(function* () {
		const diff: SpaceRecordDiff = {
			deletedIDs: [],
			newIDs: new Map(),
		};

		if (!prevRecord) {
			return diff;
		}

		const prevSpaceRecordObj = mapToObj(prevRecord, (data) => [
			data.subspaceID,
			data.record,
		]);

		yield* Effect.forEach(
			currentRecord,
			({ rows, subspaceRecord }) => {
				return Effect.gen(function* () {
					const prevClientViewRecord =
						prevSpaceRecordObj[subspaceRecord.subspaceID] ?? {};

					for (const { tableName, rows: _rows } of rows) {
						const newIDs = diff.newIDs.get(tableName) ?? new Set();

						yield* Effect.all(
							[
								Effect.forEach(
									_rows,
									({ id, version }) =>
										Effect.sync(() => {
											const prevVersion = prevClientViewRecord[id];

											if (
												version < 0 ||
												!isDefined(prevVersion) ||
												prevVersion < version
											) {
												newIDs.add(id);
											}
										}),
									{ concurrency: "unbounded" },
								),
								Effect.forEach(
									keys(prevClientViewRecord),
									(id) =>
										Effect.sync(() => {
											if (!isDefined(subspaceRecord.record[id])) {
												diff.deletedIDs.push(id);
											}
										}),
									{ concurrency: "unbounded" },
								),
							],
							{
								concurrency: 2,
							},
						);

						diff.newIDs.set(tableName, newIDs);
					}
				});
			},
			{ concurrency: "unbounded" },
		);

		return diff;
	});
};

const getOldClientRecord = ({
	key,
}: {
	key: string | undefined;
}): Effect.Effect<ClientViewRecord | undefined, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		if (!key) {
			return undefined;
		}
		const { manager } = yield* Database;
		const spaceRecord = yield* Effect.tryPromise(() =>
			manager.query.jsonTable.findFirst({
				where: (json, { eq }) => eq(json.id, key),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (spaceRecord?.value) return spaceRecord.value as ClientViewRecord;

		return undefined;
	});

const getNewClientRecord = (): Effect.Effect<
	Pick<ReplicacheClient, "id" | "lastMutationID">[],
	NeonDatabaseError,
	Database | ReplicacheContext
> =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		const { clientGroupID } = yield* ReplicacheContext;
		return yield* pipe(
			Effect.tryPromise(() =>
				manager
					.select({
						id: schema.replicacheClients.id,
						lastMutationID: schema.replicacheClients.lastMutationID,
					})
					.from(schema.replicacheClients)
					//ASSUME THAT THE CLIENT HAS MAX 20 TABS OPEN
					.where(eq(schema.replicacheClients.clientGroupID, clientGroupID))
					.limit(20),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});

const diffClientRecords = ({
	currentRecord,
	prevRecord,
}: {
	prevRecord: ExtractEffectValue<ReturnType<typeof getOldClientRecord>>;
	currentRecord: ExtractEffectValue<ReturnType<typeof getNewClientRecord>>;
}): Effect.Effect<ClientRecordDiff, never, never> => {
	return Effect.gen(function* () {
		const diff: ClientRecordDiff = {};

		if (!prevRecord)
			return mapToObj(currentRecord, (client) => [
				client.id,
				client.lastMutationID,
			]);

		yield* Effect.forEach(
			currentRecord,
			({ id, lastMutationID }) => {
				return Effect.sync(() => {
					if (
						!isDefined(prevRecord[id]) ||
						(prevRecord[id] ?? -1) < lastMutationID
					) {
						diff[id] = lastMutationID;
					}
				});
			},
			{ concurrency: "unbounded" },
		);

		return diff;
	});
};

const createSpacePatch = ({
	diff,
}: {
	diff: SpaceRecordDiff;
}): Effect.Effect<PatchOperation[], NeonDatabaseError, Database> => {
	return Effect.gen(function* () {
		const patch: PatchOperation[] = [];
		const fullRows = yield* Effect.forEach(
			Array.from(diff.newIDs.entries()),
			([tableName, ids]) => {
				return getFullRows({
					keys: Array.from(ids),
					tableName,
				});
			},
			{ concurrency: "unbounded" },
		).pipe(Effect.map((fullRows) => fullRows.flat()));

		const deletePatchEffect = Effect.forEach(
			diff.deletedIDs,
			(id) => {
				return Effect.sync(() => {
					patch.push({
						op: "del",
						key: id,
					});
				});
			},
			{ concurrency: "unbounded" },
		);
		const putPatchEffect = Effect.forEach(
			fullRows,
			(item) => {
				return Effect.sync(() => {
					if (item.id) {
						patch.push({
							op: "put",
							key: item.id,
							value: item as ReadonlyJSONObject,
						});
					}
				});
			},
			{ concurrency: "unbounded" },
		);

		yield* Effect.all([deletePatchEffect, putPatchEffect], {
			concurrency: 2,
		});

		return patch;
	});
};

const createSpaceResetPatch = (): Effect.Effect<
	PatchOperation[],
	InvalidValue | NeonDatabaseError,
	Cloudflare | ReplicacheContext | Database | AuthContext
> =>
	Effect.gen(function* () {
		yield* Effect.log("RESET PATCH");
		const { spaceID } = yield* ReplicacheContext;
		const patch: PatchOperation[] = [
			{
				op: "clear" as const,
			},
		];
		const subspaceIDs = SPACE_RECORD[spaceID];

		yield* Effect.forEach(
			subspaceIDs,
			(subspaceID) =>
				pipe(
					getRowsWTableName({
						spaceID,
						subspaceID,
						fullRows: true,
					}),
					Effect.flatMap((data) =>
						Effect.gen(function* () {
							yield* Effect.forEach(
								data,
								({ rows }) =>
									Effect.gen(function* () {
										yield* Effect.forEach(
											rows,
											(item) =>
												Effect.sync(() =>
													patch.push({
														op: "put",
														key: item.id,
														value: item as ReadonlyJSONObject,
													}),
												),
											{ concurrency: "unbounded" },
										);
									}),
								{ concurrency: "unbounded" },
							);
						}),
					),
				),
			{
				concurrency: "unbounded",
			},
		);
		return patch;
	});

const getFullRows = ({
	tableName,
	keys,
}: {
	tableName: TableName;
	keys: string[];
}): Effect.Effect<Array<{ id: string | null }>, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		if (keys.length === 0) {
			return yield* Effect.succeed([]);
		}
		return yield* fullRowsGetter(tableName, keys);
	});

export const getClientGroupObject = (): Effect.Effect<
	ClientGroupObject,
	NeonDatabaseError,
	Database | ReplicacheContext
> =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		const { clientGroupID } = yield* ReplicacheContext;
		const clientViewData = yield* Effect.tryPromise(() =>
			manager.query.replicacheClientGroups.findFirst({
				where: (clientGroup, { eq }) => eq(clientGroup.id, clientGroupID),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (clientViewData) return clientViewData;
		return {
			id: clientGroupID,
			spaceRecordVersion: 0,
			clientVersion: 0,
		};
	});
export const setClientGroupObject = ({
	clientGroupObject,
}: {
	clientGroupObject: ClientGroupObject;
}): Effect.Effect<void, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.replicacheClientGroups)
				.values({
					id: clientGroupObject.id,
					spaceRecordVersion: clientGroupObject.spaceRecordVersion,
				})
				.onConflictDoUpdate({
					target: schema.replicacheClientGroups.id,
					set: {
						spaceRecordVersion: clientGroupObject.spaceRecordVersion,
					},
				}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});

export const setClientRecord = ({
	newClientRecord,
	newKey,
}: {
	newClientRecord: Pick<ReplicacheClient, "id" | "lastMutationID">[];
	newKey: string;
}) => {
	return Effect.gen(function* () {
		if (Object.keys(newClientRecord).length === 0) return;
		const { manager } = yield* Database;
		const clientRecord = mapToObj(newClientRecord, (client) => [
			client.id,
			client.lastMutationID,
		]);
		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.jsonTable)
				.values({
					id: newKey,
					value: clientRecord,
					version: 0,
				})
				.onConflictDoUpdate({
					target: schema.jsonTable.id,
					set: {
						value: clientRecord,
					},
				}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
};
export const deleteClientRecord = ({
	key,
}: {
	key: string | undefined;
}): Effect.Effect<void, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		if (!key) return;
		const { manager } = yield* Database;
		yield* Effect.tryPromise(() =>
			manager.delete(schema.jsonTable).where(eq(schema.jsonTable.id, key)),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
export const setSpaceRecord = ({
	spaceRecord,
}: {
	spaceRecord: Array<SubspaceRecord>;
}): Effect.Effect<void, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.replicacheSubspaceRecords)
				//@ts-ignore
				.values(spaceRecord),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
export const deleteSpaceRecord = ({
	keys,
}: {
	keys: string[] | undefined;
}): Effect.Effect<void, NeonDatabaseError, Database> =>
	Effect.gen(function* () {
		if (!keys || keys.length === 0) return;
		const { manager } = yield* Database;

		yield* Effect.tryPromise(() =>
			manager
				.delete(schema.replicacheSubspaceRecords)
				.where(inArray(schema.replicacheSubspaceRecords.id, keys)),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});

export {
	createSpacePatch,
	createSpaceResetPatch,
	diffClientRecords,
	diffSpaceRecords,
	getNewClientRecord,
	getNewSpaceRecord,
	getOldClientRecord,
	getOldSpaceRecord,
};
