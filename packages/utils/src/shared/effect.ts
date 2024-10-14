import type { Effect } from "effect";

type ExtractEffectValue<E> = E extends Effect.Effect<infer Value, Error, any>
	? Value
	: never;

export type { ExtractEffectValue };
