import { z } from "zod";

export const DeleteComment = z.object({
    id: z.string(),
    boardId: z.string(),
});
