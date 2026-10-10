import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";

interface BoardNavBarProps {
    data: Board;
}

export const BoardNavBar = async ({ data }: BoardNavBarProps) => {
    return (
        <div className="fixed top-14 z-40 flex h-14 w-full items-center gap-x-4 border-b border-white/10 bg-black/25 px-4 text-white backdrop-blur-md md:px-6">
            <BoardTitleForm data={data} />
            <div className="ml-auto">
                <BoardOptions id={data.id} />
            </div>
        </div>
    );
};
