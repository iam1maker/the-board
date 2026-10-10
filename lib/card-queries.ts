import { Prisma } from "@prisma/client";

/** What the board view needs to render a card's badges. */
export const BOARD_CARD_INCLUDE = {
    labels: {
        include: { label: true },
        orderBy: { createdAt: "asc" },
    },
    checklists: {
        select: { items: { select: { completed: true } } },
    },
    _count: { select: { comments: true } },
} satisfies Prisma.CardInclude;

/** Everything the card modal shows, plus the board's labels and lists. */
export const CARD_DETAIL_INCLUDE = {
    list: {
        select: {
            id: true,
            title: true,
            board: {
                select: {
                    id: true,
                    labels: { orderBy: { createdAt: "asc" } },
                    lists: {
                        select: { id: true, title: true },
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    },
    labels: {
        include: { label: true },
        orderBy: { createdAt: "asc" },
    },
    checklists: {
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" },
    },
} satisfies Prisma.CardInclude;
