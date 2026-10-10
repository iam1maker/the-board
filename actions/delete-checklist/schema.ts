import { z } from "zod";

export const DeleteChecklist = z.object({
    id: z.string(),
    boardId: z.string(),
});
