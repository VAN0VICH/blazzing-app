import { char } from "drizzle-orm/pg-core";
import { z } from "zod";

export const ulid = (name: string) => char(name, { length: 26 + 4 });

export const id = {
	get id() {
		return ulid("id").primaryKey();
	},
};

const ImageSchema = z.object({
	id: z.string(),
	name: z.string(),
	order: z.number(),
	url: z.string(),
	trimmed: z
		.object({
			left: z.number(),
			right: z.number(),
			top: z.number(),
			bottom: z.number(),
		})
		.optional(),
	fileType: z.string(),
	base64: z.string().optional(),
});

type Image = {
	id: string;
	url: string;
	trimmed?: boolean;
};
export { ImageSchema };
export type { Image };
