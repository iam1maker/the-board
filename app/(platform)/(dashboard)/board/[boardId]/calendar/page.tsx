import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { getBoardViewData } from "@/lib/board-data";
import { CalendarView } from "@/components/board-views/calendar-view";

export const metadata = { title: "Calendar" };

const BoardCalendarPage = async ({
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
            <CalendarView boardId={params.boardId} cards={data.cards} />
        </div>
    );
};

export default BoardCalendarPage;
