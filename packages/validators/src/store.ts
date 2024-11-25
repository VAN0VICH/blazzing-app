import { ImageSchema, schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type ActiveStoreID = {
	value: string;
};

const StoreSchema = createInsertSchema(schema.stores);
export const CreateStoreSchema = z.object({
	store: StoreSchema,
});

export type InsertStore = z.infer<typeof StoreSchema>;
export type CreateStore = z.infer<typeof CreateStoreSchema>;
export const StoreUpdates = StoreSchema.pick({
	currencyCodes: true,
	description: true,
})
	.extend({
		name: z.string().optional(),
		headerImage: ImageSchema.optional(),
		croppedHeaderImage: ImageSchema.optional(),
		image: ImageSchema.optional(),
		croppedImage: ImageSchema.optional(),
	})
	.partial();
export const UpdateStoreSchema = z.object({
	updates: StoreUpdates,
	id: z.string(),
});
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;

export const SetActiveStoreIDSchema = z.object({
	id: z.string(),
});
export type SetActiveStoreID = z.infer<typeof SetActiveStoreIDSchema>;

export const UploadStoreImageSchema = z.object({
	id: z.string(),
	image: ImageSchema,
	type: z.enum(["store", "header"] as const),
});
export type UploadStoreImage = z.infer<typeof UploadStoreImageSchema>;
export const DeleteStoreImageSchema = z.object({
	storeID: z.string(),
	url: z.string(),
	type: z.enum(["store", "header"] as const),
});
export type DeleteStoreImage = z.infer<typeof DeleteStoreImageSchema>;
