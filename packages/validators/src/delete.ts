import { z } from "zod";

export const DeleteInputSchema = z.object({
	keys: z.string().array(),
});
export type DeleteInput = z.infer<typeof DeleteInputSchema>;
