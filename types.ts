import { List, Prisma } from "@prisma/client";

import { BOARD_CARD_INCLUDE, CARD_DETAIL_INCLUDE } from "@/lib/card-queries";

export type BoardCard = Prisma.CardGetPayload<{
    include: typeof BOARD_CARD_INCLUDE;
}>;

export type ListWithCards = List & {
    cards: BoardCard[];
};

export type CardDetail = Prisma.CardGetPayload<{
    include: typeof CARD_DETAIL_INCLUDE;
}>;



