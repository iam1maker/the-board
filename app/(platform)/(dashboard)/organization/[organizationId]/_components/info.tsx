"use client";

import Image from "next/image";
import { useOrganization } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface InfoProps {
    isPro: boolean;
}

export const Info = ({ isPro }: InfoProps) => {
    const { organization, isLoaded } = useOrganization();

    if (!isLoaded || !organization) {
        return <Info.Skeleton />;
    }

    return (
        <div className="flex items-center gap-x-4">
            <div className="relative h-14 w-14 shrink-0">
                <Image
                    fill
                    src={organization.imageUrl}
                    alt=""
                    className="rounded-xl object-cover"
                />
            </div>
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    {organization.name}
                </h1>
                <span
                    className={cn(
                        "inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                        isPro
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                    )}
                >
                    {isPro && <Sparkles className="h-3 w-3" aria-hidden />}
                    {isPro ? "Pro plan" : "Free plan"}
                </span>
            </div>
        </div>
    );
};

Info.Skeleton = function SkeletonInfo() {
    return (
        <div className="flex items-center gap-x-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-5 w-[80px] rounded-full" />
            </div>
        </div>
    );
};
