"use client";

import { useState } from "react";
import { AuditLog, Comment } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "sonner";

import { CardDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityItem } from "@/components/activity-item";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { RichTextViewer } from "@/components/rich-text/rich-text-viewer";
import { useCardAction } from "@/hooks/use-card-action";
import { createComment } from "@/actions/create-comment";
import { deleteComment } from "@/actions/delete-comment";

const SHOW_DETAILS_KEY = "t-card-show-details";

type FeedEntry =
    | { kind: "comment"; at: number; comment: Comment }
    | { kind: "log"; at: number; log: AuditLog };

interface CommentsActivityProps {
    card: CardDetail;
    comments?: Comment[];
    logs?: AuditLog[];
}

export const CommentsActivity = ({
    card,
    comments,
    logs,
}: CommentsActivityProps) => {
    const [showDetails, setShowDetails] = useLocalStorage(
        SHOW_DETAILS_KEY,
        false,
    );

    const feed: FeedEntry[] = [
        ...(comments ?? []).map((comment) => ({
            kind: "comment" as const,
            at: new Date(comment.createdAt).getTime(),
            comment,
        })),
        ...(showDetails ? (logs ?? []) : []).map((log) => ({
            kind: "log" as const,
            at: new Date(log.createdAt).getTime(),
            log,
        })),
    ].sort((a, b) => b.at - a.at);

    return (
        <section aria-label="Comments and activity" className="space-y-4">
            <div className="flex items-center gap-x-2">
                <MessageSquare
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                />
                <h3 className="text-sm font-semibold text-foreground">
                    Comments and activity
                </h3>
                <Button
                    variant="gray"
                    size="sm"
                    className="ml-auto h-7 px-2.5 text-xs"
                    aria-pressed={showDetails}
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? "Hide details" : "Show details"}
                </Button>
            </div>

            <CommentComposer card={card} />

            {!comments ? (
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                </div>
            ) : feed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No comments yet
                    {showDetails ? "" : ". Show details to see activity"}.
                </p>
            ) : (
                <ol className="space-y-4">
                    {feed.map((entry) =>
                        entry.kind === "comment" ? (
                            <CommentItem
                                key={entry.comment.id}
                                card={card}
                                comment={entry.comment}
                            />
                        ) : (
                            <ActivityItem key={entry.log.id} data={entry.log} />
                        ),
                    )}
                </ol>
            )}
        </section>
    );
};

const CommentComposer = ({ card }: { card: CardDetail }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { execute, isLoading } = useCardAction(createComment, card.id, {
        refreshComments: true,
        onSuccess: () => setIsOpen(false),
    });

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                Write a comment…
            </button>
        );
    }

    return (
        <RichTextEditor
            placeholder="Write a comment…"
            submitLabel="Save"
            isSubmitting={isLoading}
            autoFocus
            onCancel={() => setIsOpen(false)}
            // On success the composer closes (and unmounts the editor); on error
            // the text stays so nothing is lost.
            onSubmit={(content) => {
                if (!content) {
                    toast.error("Comment is empty");
                    return;
                }
                execute({
                    cardId: card.id,
                    boardId: card.list.board.id,
                    content,
                });
            }}
        />
    );
};

const CommentItem = ({
    card,
    comment,
}: {
    card: CardDetail;
    comment: Comment;
}) => {
    const { user } = useUser();
    const isOwn = user?.id === comment.userId;

    const { execute, isLoading } = useCardAction(deleteComment, card.id, {
        refreshComments: true,
    });

    return (
        <li className="flex items-start gap-x-3">
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.userImage} alt="" />
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                    {comment.userName.trim().charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="text-sm">
                    <span className="font-semibold text-foreground">
                        {comment.userName}
                    </span>{" "}
                    <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        className="text-xs text-muted-foreground"
                    >
                        {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                        })}
                    </time>
                </p>
                <div className="mt-1 rounded-lg border bg-card px-3 py-2 shadow-sm">
                    <RichTextViewer content={comment.content} />
                </div>
                {isOwn && (
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                            execute({
                                id: comment.id,
                                boardId: card.list.board.id,
                            })
                        }
                        className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Delete
                    </button>
                )}
            </div>
        </li>
    );
};
