import { z } from "zod";

export const MessageSchema = z.array(z.string());
