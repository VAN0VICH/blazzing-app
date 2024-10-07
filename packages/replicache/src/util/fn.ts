import type { Effect } from "effect";
import type { z, ZodError } from "zod";

import type {
	AuthorizationError,
	ImageUploadError,
	InvalidValue,
	NeonDatabaseError,
	NotFound,
	StripeError,
	TableNotFound,
} from "@blazzing-app/validators";
import type { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import type { TableMutator } from "../context";

export function fn<Schema extends z.ZodSchema>(
	schema: Schema,
	func: (
		value: z.infer<Schema>,
	) => Effect.Effect<
		void,
		| TableNotFound
		| ZodError
		| AuthorizationError
		| NeonDatabaseError
		| NotFound
		| ImageUploadError
		| InvalidValue
		| StripeError,
		TableMutator | Database | Cloudflare | AuthContext
	>,
) {
	const result = (input: z.infer<Schema>) => {
		const parsed = schema.parse(input);

		return func(parsed);
	};

	return result;
}
