import Link from "next/link";
import {
    ArrowRight,
    History,
    LayoutDashboard,
    Move,
    Users,
    type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAX_FREE_BOARDS } from "@/constants/board";
import { BoardPreview } from "./_components/board-preview";

type Feature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const FEATURES: Feature[] = [
    {
        icon: LayoutDashboard,
        title: "Boards, lists and cards",
        description:
            "Break any project into lists and cards, with descriptions for the details that matter.",
    },
    {
        icon: Move,
        title: "Drag and drop",
        description:
            "Reorder lists and move cards between them with mouse or keyboard. Changes save instantly.",
    },
    {
        icon: History,
        title: "Activity log",
        description:
            "See who created, renamed or deleted what, across the whole workspace and on every card.",
    },
    {
        icon: Users,
        title: "Team workspaces",
        description:
            "Invite teammates into an organization and keep each team's boards in one place.",
    },
];

const MarketingPage = () => {
    return (
        <>
            <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pt-24">
                <div className="mx-auto max-w-3xl text-center motion-safe:animate-fade-up">
                    <p className="mb-6 inline-flex items-center rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
                        <span className="mr-2 h-2 w-2 rounded-full bg-highlight" />
                        Free for small teams, {MAX_FREE_BOARDS} boards included
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                        Move your team&apos;s work{" "}
                        <span className="text-primary">forward.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Collaborate, manage projects, and reach new productivity
                        peaks. From high-rises to the home office, the way your
                        team works is unique. Accomplish it all with Taskify.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button size="lg" variant="primary" asChild>
                            <Link href="/sign-up">
                                Start for free
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/sign-in">I already have an account</Link>
                        </Button>
                    </div>
                </div>
                <div className="mx-auto mt-14 max-w-5xl motion-safe:animate-fade-up [animation-delay:120ms]">
                    <BoardPreview />
                </div>
            </section>

            <section className="border-t bg-card">
                <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Everything a team board needs
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            No complicated setup. Create a board, add lists, and
                            start moving cards.
                        </p>
                    </div>
                    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({ icon: Icon, title, description }) => (
                            <li
                                key={title}
                                className="rounded-xl border bg-background p-6"
                            >
                                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                                    <Icon className="h-5 w-5" aria-hidden />
                                </span>
                                <h3 className="font-semibold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-8 py-10 text-center md:flex-row md:text-left">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-foreground">
                            Ready to get organized?
                        </h2>
                        <p className="mt-2 text-primary-foreground/80">
                            Set up your first board in under a minute.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90"
                        asChild
                    >
                        <Link href="/sign-up">Get Taskify for free</Link>
                    </Button>
                </div>
            </section>
        </>
    );
};
export default MarketingPage;
