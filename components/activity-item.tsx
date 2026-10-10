import { AuditLog } from "@prisma/client";
import { format } from "date-fns";

import { generateLogMessage } from "@/lib/generate-log-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItemProps {
    data: AuditLog;
}

export const ActivityItem = ({ data }: ActivityItemProps) => {
    return (
        <li className="flex items-start gap-x-3">
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={data.userImage} alt="" />
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                    {data.userName.trim().charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-0.5">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                        {data.userName}
                    </span>
                    {generateLogMessage(data)}
                </p>
                <time
                    dateTime={new Date(data.createdAt).toISOString()}
                    className="text-xs text-muted-foreground"
                >
                    {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </time>
            </div>
        </li>
    );
};
