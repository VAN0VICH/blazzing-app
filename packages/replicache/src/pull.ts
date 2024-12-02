import { Clock, Console, Effect, Layer } from "effect";
import type { PatchOperation, PullResponseOKV1 } from "replicache";

import type { Db } from "@blazzing-app/db";
import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type Cookie,
	type InvalidValue,
	type PullRequest,
} from "@blazzing-app/validators";
import { ulid } from "ulidx";
import { ReplicacheContext } from "./context/replicache";
import { RecordManager } from "./record-manager";

export const pull = ({
	body: pull,
	db,
}: {
	body: PullRequest;
	db: Db;
}): Effect.Effect<
	PullResponseOKV1,
	NeonDatabaseError | InvalidValue,
	ReplicacheContext | Cloudflare | AuthContext
> =>
	Effect.gen(function* (_) {
		const { spaceID } = yield* ReplicacheContext;
		const { authUser } = yield* AuthContext;
		const { bindings, get } = yield* Cloudflare;
		const requestCookie = pull.cookie;
		yield* _(Effect.log(`SPACE ID ${spaceID}`));

		if (spaceID === "dashboard" && !authUser) {
			yield* _(Effect.log("not authorized"));
			const resp: PullResponseOKV1 = {
				lastMutationIDChanges: {},
				//@ts-ignore
				cookie: requestCookie,
				patch: [],
			};
			return resp;
		}
		yield* _(
			Effect.log("----------------------------------------------------"),
		);

		yield* _(Effect.log(`PROCESSING PULL: ${JSON.stringify(pull, null, "")}`));

		const startTransact = yield* _(Clock.currentTimeMillis);

		// 1: GET PREVIOUS SPACE RECORD AND CLIENT RECORD KEYS
		const oldSpaceRecordKey = requestCookie?.spaceRecordKey;
		const oldClientRecordKey = requestCookie?.clientRecordKey;

		// 2: BEGIN PULL TRANSACTION
		const processPull = yield* _(
			Effect.tryPromise(() =>
				db
					.transaction(
						async (transaction) =>
							Effect.gen(function* (_) {
								const newSpaceRecordKey = ulid();
								const newClientRecordKey = ulid();

								// 4: GET PREVIOUS AND CURRENT RECORDS. (1 ROUND TRIP TO THE DATABASE)
								const [
									oldSpaceRecord,
									oldClientRecord,
									newSpaceRecord,
									newClientRecord,
									clientGroupObject,
								] = yield* _(
									Effect.all(
										[
											RecordManager.getOldSpaceRecord({
												key: oldSpaceRecordKey,
											}),
											RecordManager.getOldClientRecord({
												key: oldClientRecordKey,
											}),
											RecordManager.getNewSpaceRecord({ newSpaceRecordKey }),
											RecordManager.getNewClientRecord(),
											RecordManager.getClientGroupObject(),
										],
										{
											concurrency: 5,
										},
									),
								);

								const currentTime = yield* _(Clock.currentTimeMillis);

								yield* _(
									Effect.log(
										`TOTAL TIME OF GETTING RECORDS ${
											currentTime - startTransact
										}`,
									),
								);

								// 5: GET RECORDS DIFF
								const [spaceDiff, clientDiff] = yield* _(
									Effect.all([
										RecordManager.diffSpaceRecords({
											prevRecord: oldSpaceRecord,
											currentRecord: newSpaceRecord,
										}),
										RecordManager.diffClientRecords({
											prevRecord: oldClientRecord,
											currentRecord: newClientRecord,
										}),
									]),
								);
								// 5: GET THE PATCH: THE DIFF TO THE SPACE RECORD. (2D ROUND TRIP TO THE DATABASE)
								// IF PREVIOUS SPACE RECORD IS NOT FOUND, THEN RESET THE SPACE RECORD

								const spacePatch = oldSpaceRecord
									? yield* _(
											RecordManager.createSpacePatch({ diff: spaceDiff }),
										)
									: yield* _(RecordManager.createSpaceResetPatch());

								// ADD INDICATION THAT THE CLIENT HAS PULLED.
								spacePatch.push({
									key: "init",
									op: "put",
									value: "true",
								} satisfies PatchOperation);

								// ADD ORDER DISPLAY ID
								const storeID = get("storeID");
								const displayID = yield* Effect.tryPromise(() =>
									bindings.KV.get(`order_display_id_${storeID}`),
								).pipe(Effect.orDie);
								yield* Console.log("display id 1", displayID);

								spacePatch.push({
									key: "display_id",
									op: "put",
									value: displayID ? JSON.parse(displayID) : 0,
								} satisfies PatchOperation);
								if (!displayID)
									yield* Effect.tryPromise(() =>
										bindings.KV.put(`order_display_id_${storeID}`, "0", {
											expirationTtl: 12 * 60 * 60, // 12 hours in seconds
										}),
									).pipe(Effect.orDie);

								// 6: PREPARE UPDATES
								const oldSpaceRecordVersion = Math.max(
									clientGroupObject.spaceRecordVersion,
									requestCookie?.order ?? 0,
								);
								const nextSpaceRecordVersion = oldSpaceRecordVersion + 1;
								clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion;

								const nothingToUpdate =
									spacePatch.length === 0 &&
									Object.keys(clientDiff).length === 0;

								// 7: CREATE THE PULL RESPONSE
								const resp: PullResponseOKV1 = {
									lastMutationIDChanges: clientDiff,
									cookie: {
										...requestCookie,
										spaceRecordKey: nothingToUpdate
											? oldSpaceRecordKey
											: newSpaceRecordKey,
										clientRecordKey: nothingToUpdate
											? oldClientRecordKey
											: newClientRecordKey,
										order: nothingToUpdate
											? oldSpaceRecordVersion
											: nextSpaceRecordVersion,
									} satisfies Cookie,
									patch: spacePatch,
								};
								yield* _(Effect.log(`pull response ${JSON.stringify(resp)}`));

								// 8: UPDATE RECORDS IF THERE ARE CHANGES. (3D ROUND TRIP TO THE DATABASE)
								if (!nothingToUpdate) {
									yield* _(Effect.log("UPDATING RECORDS"));
									yield* _(
										Effect.all(
											[
												RecordManager.setSpaceRecord({
													spaceRecord: newSpaceRecord.map(
														(record) => record.subspaceRecord,
													),
												}),
												RecordManager.setClientGroupObject({
													clientGroupObject,
												}),
												RecordManager.deleteSpaceRecord({
													keys: oldSpaceRecord
														? oldSpaceRecord.map((r) => r.id)
														: undefined,
												}),
												RecordManager.setClientRecord({
													newClientRecord,
													newKey: newClientRecordKey,
												}),
												RecordManager.deleteClientRecord({
													key: oldClientRecordKey,
												}),
											],
											{
												concurrency: 5,
											},
										),
									);
								}

								return resp;
							}).pipe(
								Effect.provide(
									Layer.succeed(Database, {
										manager: transaction,
									}),
								),
							),
						{ isolationLevel: "repeatable read", accessMode: "read write" },
					)
					.catch((err) => {
						console.log("error", err);
						throw new Error("neon database error");
					}),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({
							message: error.message,
						}),
				}),
			),
		);

		const response = yield* _(processPull);

		const endTransact = yield* _(Clock.currentTimeMillis);

		yield* _(Effect.log(`TOTAL TIME ${endTransact - startTransact}`));

		yield* _(
			Effect.log("----------------------------------------------------"),
		);

		return response;
	});
