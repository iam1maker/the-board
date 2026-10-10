import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { getBoardViewData } from "@/lib/board-data";
import { TimelineView } from "@/components/board-views/timeline-view";

export const metadata = { title: "Timeline" };

const BoardTimelinePage = async ({
    params,
}: {
    params: { boardId: string };
}) => {
    const { orgId } = auth();
    if (!orgId) {
        redirect("/select-org");
    }

    const data = await getBoardViewData(params.boardId, orgId);
    if (!data) {
        notFound();
    }

    return (
        <div className="h-full p-4 md:px-6">
            <TimelineView cards={data.cards} lists={data.lists} />
        </div>
    );
};

export default BoardTimelinePage;
