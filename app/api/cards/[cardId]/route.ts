import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureDefaultLabels } from "@/lib/labels";
import { CARD_DETAIL_INCLUDE } from "@/lib/card-queries";

/**
 * 获取卡片详情：标签、清单，以及所在看板的标签和列表（用于标签选择和移动卡片）。
 */
export async function GET(
    req: Request,
    { params }: { params: { cardId: string } },
) {
    try {
        const { userId, orgId } = auth();
        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const where = {
            id: params.cardId,
            list: { board: { orgId } },
        };

        const owner = await db.card.findUnique({
            where,
            select: { list: { select: { boardId: true } } },
        });
        if (!owner) {
            return new NextResponse("Not found", { status: 404 });
        }

        // 老看板第一次打开卡片时补上默认标签。
        await ensureDefaultLabels(owner.list.boardId);

        const card = await db.card.findUnique({
            where,
            include: CARD_DETAIL_INCLUDE,
        });
        return NextResponse.json(card);
    } catch (error) {
        console.error("[CARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
