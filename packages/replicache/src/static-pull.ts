import { Clock, Effect, pipe } from "effect";
import type { PatchOperation, PullResponseOKV1 } from "replicache";

import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	KVError,
	NeonDatabaseError,
	type Category,
	type Cookie,
	type PullRequest,
} from "@blazzing-app/validators";

import { ulid } from "ulidx";
import { schema } from "@blazzing-app/db";

export const staticPull = ({
	body: pull,
}: {
	body: PullRequest;
}) =>
	Effect.gen(function* () {
		yield* Effect.log("----------------------------------------------------");
		yield* Effect.log(
			`PROCESSING STATIC PULL: ${JSON.stringify(pull, null, "")}`,
		);

		const requestCookie = pull.cookie;
		const start = yield* Clock.currentTimeMillis;
		const patch: PatchOperation[] = [];

		// 1: GET STATIC PULL KEY. IF IT EXIST, DO NOTHING, IF DOESNT THEN PULL ALL STATIC DATA
		const staticPullKey = requestCookie?.staticPullKey;
		const newStaticPullKey = ulid();

		const response: PullResponseOKV1 = {
			lastMutationIDChanges: {},
			cookie: {
				...requestCookie,
				order: 0,
				staticPullKey: staticPullKey ?? newStaticPullKey,
			} satisfies Cookie,
			patch,
		};

		if (staticPullKey) {
			yield* Effect.log(`pull response ${JSON.stringify(response)}`);

			return response;
		}

		yield* Effect.log("Not cached");
		patch.push({ op: "clear" });
		const categories = yield* getCategories();
		yield* Effect.forEach(
			categories,
			(category) =>
				Effect.sync(() =>
					patch.push({
						op: "put",
						key: category.id,
						value: { ...category, parentID: category.parentID ?? "" },
					}),
				),
			{ concurrency: "unbounded" },
		);
		const end = yield* Clock.currentTimeMillis;

		yield* Effect.log(`pull response ${JSON.stringify(response)}`);

		yield* Effect.log(`TOTAL TIME ${end - start}`);

		yield* Effect.log("----------------------------------------------------");

		return response;
	});

export const getCategories = () => {
	return Effect.gen(function* () {
		const { bindings } = yield* Cloudflare;
		const { manager } = yield* Database;
		const cachedCategories = yield* Effect.tryPromise(
			() => bindings.KV.get("categories", "json") as Promise<Category[]>,
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					Effect.fail(new KVError({ message: error.message })),
			}),
		);

		if (cachedCategories) {
			yield* Effect.log("returning cached response");
			return cachedCategories;
		}
		const categories = yield* pipe(
			Effect.tryPromise(
				() => manager.select().from(schema.categories) as Promise<Category[]>,
			),
			Effect.catchTags({
				UnknownException: (error) =>
					Effect.fail(new NeonDatabaseError({ message: error.message })),
			}),
		);

		yield* Effect.tryPromise(() =>
			bindings.KV.put("categories", JSON.stringify(categories)),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					Effect.fail(new KVError({ message: error.message })),
			}),
		);
		return categories;
	});
};
