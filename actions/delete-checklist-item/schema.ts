import { z } from "zod";

export const DeleteChecklistItem = z.object({
    id: z.string(),
    boardId: z.string(),
});
