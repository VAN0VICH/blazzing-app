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
	alt: z.string(),
	order: z.number(),
	url: z.string().optional(),
	cropped: z
		.object({
			url: z.string(),
			base64: z.string().optional(),
			fileType: z.string().optional(),
		})
		.optional(),
	fileType: z.string().optional(),
	base64: z.string().optional(),
});

type Image = z.infer<typeof ImageSchema>;
export { ImageSchema };
export type { Image };
