import { Schema } from "@effect/schema";
import { Data } from "effect";
import { z } from "zod";

export const InputFieldSchema = z.object({
	type: z.enum(["NotFound", "InvalidInput", "AlreadyExist"]),
	message: z.string(),
});
export const FileFieldSchema = z.object({
	type: z.enum(["TooLarge", "InvalidType"]),
	message: z.string(),
});

export enum ErrorType {
	InvalidValue = "InvalidValue",
	PermissionDenied = "PermissionDenied",
	ParsingError = "ParsingError",
	InternalServerError = "InternalServerError",
	NotFound = "NotFound",
	AuthorizationError = "AuthorizationError",
	AuthenticationError = "AuthenticationError",
	InvalidInput = "InvalidInput",
	AlreadyExist = "AlreadyExist",
	NeonDatabaseError = "NeonDatabaseError",
}
export const ErrorTypeSchema = Schema.Literal(
	"InvalidValue",
	"PermissionDenied",
	"ParsingError",
	"InternalServerError",
	"NotFound",
	"AuthorizationError",
	"AuthenticationError",
	"InvalidInput",
	"AlreadyExist",
	"NeonDatabaseError",
);

export type Success = "Success";
export type Error = typeof ErrorType;

export class AuthenticationError extends Data.TaggedError(
	"AuthenticationError",
)<{
	readonly message: string;
}> {}
export class InvalidValue extends Data.TaggedError("InvalidValue")<{
	readonly message: string;
}> {}
export class PermissionDenied extends Data.TaggedError("PermissionDenied")<{
	readonly message: string;
}> {}
export class ParsingError extends Data.TaggedError("ParsingError")<{
	readonly message: string;
}> {}
export class MutatorNotFoundError extends Data.TaggedError(
	"MutatorNotFoundError",
)<{
	readonly message: string;
}> {}
export class TableNotFound extends Data.TaggedError("TableNotFound")<{
	readonly message: string;
}> {}
export class AuthorizationError extends Data.TaggedError("AuthorizationError")<{
	readonly message: string;
}> {}
export class InvalidInput extends Data.TaggedError("InvalidInput")<{
	readonly message: string;
}> {}
export class AlreadyExist extends Data.TaggedError("AlreadyExist")<{
	readonly message: string;
}> {}

export class NeonDatabaseError extends Data.TaggedError("NeonDatabaseError")<{
	readonly message: string;
}> {}

export class KVError extends Data.TaggedError("KVError")<{
	readonly message: string;
}> {}

export class PriceNotFound extends Data.TaggedError("PriceNotFound")<{
	readonly message: string;
}> {}

export class CartError extends Data.TaggedError("CartError")<{
	readonly message: string;
}> {}

export class NotFound extends Data.TaggedError("NotFound")<{
	readonly message: string;
}> {}

export class ImageUploadError extends Data.TaggedError("ImageUploadError")<{
	readonly message: string;
}> {}

export class ClientMutatorError extends Data.TaggedError("ClientMutatorError")<{
	readonly message: string;
}> {}
export class StripeError extends Data.TaggedError("StripeError")<{
	readonly message: string;
}> {}
