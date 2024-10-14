import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const CreateClientErrorSchema = createInsertSchema(schema.clientErrors);
export type InsertError = z.infer<typeof CreateClientErrorSchema>;
