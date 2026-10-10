import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { getBoardViewData } from "@/lib/board-data";
import { DashboardView } from "@/components/board-views/dashboard-view";

export const metadata = { title: "Dashboard" };

const BoardDashboardPage = async ({
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
            <DashboardView
                cards={data.cards}
                lists={data.lists}
                labels={data.labels}
            />
        </div>
    );
};

export default BoardDashboardPage;
