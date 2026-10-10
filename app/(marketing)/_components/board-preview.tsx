import { cn } from "@/lib/utils";

type PreviewCard = {
    title: string;
    tag?: { label: string; tone: "teal" | "orange" | "slate" };
};

type PreviewList = {
    title: string;
    cards: PreviewCard[];
};

const PREVIEW_LISTS: PreviewList[] = [
    {
        title: "To do",
        cards: [
            { title: "Draft Q3 roadmap", tag: { label: "Planning", tone: "teal" } },
            { title: "Collect feedback from beta users" },
            { title: "Update onboarding copy", tag: { label: "Content", tone: "slate" } },
        ],
    },
    {
        title: "In progress",
        cards: [
            { title: "Redesign board settings", tag: { label: "Design", tone: "orange" } },
            { title: "Stripe billing portal" },
        ],
    },
    {
        title: "Done",
        cards: [
            { title: "Ship drag and drop", tag: { label: "Shipped", tone: "teal" } },
            { title: "Activity log per card" },
        ],
    },
];

const TAG_TONES = {
    teal: "bg-secondary text-secondary-foreground",
    orange: "bg-orange-50 text-highlight",
    slate: "bg-muted text-muted-foreground",
} as const;

/** Static, decorative illustration of a board used on the landing page. */
export const BoardPreview = () => {
    return (
        <div
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-slate-900/5"
        >
            <div className="flex items-center gap-x-2 border-b bg-muted/60 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                    Product launch
                </span>
            </div>
            <div className="grid grid-cols-1 gap-3 bg-gradient-to-br from-teal-700 to-teal-900 p-4 sm:grid-cols-3">
                {PREVIEW_LISTS.map((list) => (
                    <div key={list.title} className="rounded-xl bg-list p-2.5">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="text-sm font-semibold text-foreground">
                                {list.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {list.cards.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {list.cards.map((card) => (
                                <div
                                    key={card.title}
                                    className="rounded-lg border bg-card px-3 py-2 shadow-sm"
                                >
                                    {card.tag && (
                                        <span
                                            className={cn(
                                                "mb-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold",
                                                TAG_TONES[card.tag.tone]
                                            )}
                                        >
                                            {card.tag.label}
                                        </span>
                                    )}
                                    <p className="text-sm text-foreground">
                                        {card.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
