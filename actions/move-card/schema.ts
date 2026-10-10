import { z } from "zod";

export const MoveCard = z.object({
    id: z.string(),
    boardId: z.string(),
    listId: z.string(),
});
