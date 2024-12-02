import { z } from "zod";

export const AddAdminSchema = z.object({
	email: z.string().email(),
	storeID: z.string(),
});
export type AddAdmin = z.infer<typeof AddAdminSchema>;

export const RemoveAdminSchema = z.object({
	email: z.string().email(),
	storeID: z.string(),
});
export type RemoveAdmin = z.infer<typeof RemoveAdminSchema>;
