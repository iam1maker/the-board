import { db } from "@/lib/db";
import { DEFAULT_LABEL_COLORS } from "@/constants/labels";

/** Give a board Trello's default unnamed color labels if it has none yet. */
export const ensureDefaultLabels = async (boardId: string) => {
    const count = await db.label.count({ where: { boardId } });
    if (count > 0) {
        return;
    }
    await db.label.createMany({
        data: DEFAULT_LABEL_COLORS.map((color) => ({ boardId, color })),
    });
};
