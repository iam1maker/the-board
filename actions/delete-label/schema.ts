import { z } from "zod";

export const DeleteLabel = z.object({
    id: z.string(),
    boardId: z.string(),
});
