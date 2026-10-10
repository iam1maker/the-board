import { db } from "@/lib/db";
import { ensureDefaultLabels } from "@/lib/labels";
import { BOARD_CARD_INCLUDE } from "@/lib/card-queries";
import { BoardCard, ListWithCards } from "@/types";

/** Lists (in order) with their cards and badge data, scoped to the org. */
export const getBoardLists = (boardId: string, orgId: string) =>
    db.list.findMany({
        where: { boardId, board: { orgId } },
        include: {
            cards: {
                include: BOARD_CARD_INCLUDE,
                orderBy: { order: "asc" },
            },
        },
        orderBy: { order: "asc" },
    });

export const getBoardLabels = async (boardId: string) => {
    await ensureDefaultLabels(boardId);
    return db.label.findMany({
        where: { boardId },
        orderBy: { createdAt: "asc" },
    });
};

export type CardWithListInfo = BoardCard & {
    list: { id: string; title: string };
};

/** Flatten lists into one card array, each card tagged with its list. */
export const flattenCards = (lists: ListWithCards[]): CardWithListInfo[] =>
    lists.flatMap((list) =>
        list.cards.map((card) => ({
            ...card,
            list: { id: list.id, title: list.title },
        })),
    );

/** Everything a board view page needs; null when the board isn't in the org. */
export const getBoardViewData = async (boardId: string, orgId: string) => {
    const board = await db.board.findUnique({
        where: { id: boardId, orgId },
        select: { id: true },
    });
    if (!board) {
        return null;
    }
    const [lists, labels] = await Promise.all([
        getBoardLists(boardId, orgId),
        getBoardLabels(boardId),
    ]);
    return {
        lists: lists.map(({ id, title }) => ({ id, title })),
        cards: flattenCards(lists),
        labels,
    };
};
