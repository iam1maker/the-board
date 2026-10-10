import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { getBoardViewData } from "@/lib/board-data";
import { TableView } from "@/components/board-views/table-view";

export const metadata = { title: "Table" };

const BoardTablePage = async ({ params }: { params: { boardId: string } }) => {
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
            <TableView
                cards={data.cards}
                lists={data.lists}
                labels={data.labels}
            />
        </div>
    );
};

export default BoardTablePage;
