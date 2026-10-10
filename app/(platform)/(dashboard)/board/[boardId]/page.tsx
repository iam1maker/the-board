import { auth } from "@clerk/nextjs";
import { getBoardLists } from "@/lib/board-data";
import { redirect } from "next/navigation";
import { ListContainer } from "./_components/list-container";

interface BoardIdPageProps {
    params: {
        boardId: string;
    };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const lists = await getBoardLists(params.boardId, orgId);

    return (
        <div className="h-full overflow-x-auto p-4 md:px-6">
            <ListContainer boardId={params.boardId} data={lists} />
        </div>
    );
};

export default BoardIdPage;
