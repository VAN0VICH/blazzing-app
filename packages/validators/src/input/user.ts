import { ImageSchema, schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertUserSchema = createInsertSchema(schema.users);
export type InsertUser = z.infer<typeof InsertUserSchema>;
export const OnboardSchema = z.object({
	username: z.string(),
	countryCode: z.string(),
});
export type Onboard = z.infer<typeof OnboardSchema>;
export const UserUpdatesSchema = InsertUserSchema.pick({
	username: true,
	description: true,
	fullName: true,
	email: true,
	phone: true,
}).extend({
	avatar: ImageSchema.optional(),
	croppedAvatar: ImageSchema.optional(),
});
export const UpdateUserSchema = z.object({
	updates: UserUpdatesSchema.partial(),
	id: z.string(),
});
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export const DeleteAvatarSchema = z.object({
	userID: z.string(),
	url: z.string(),
});
export type DeleteAvatar = z.infer<typeof DeleteAvatarSchema>;
