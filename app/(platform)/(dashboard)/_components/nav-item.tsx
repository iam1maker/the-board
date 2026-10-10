"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Activity, CreditCard, Layout, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

export type Organization = {
    id: string;
    slug: string;
    imageUrl: string;
    name: string;
};

interface NavItemProps {
    isExpanded: boolean;
    isActive: boolean;
    organization: Organization;
    onExpand: (id: string) => void;
}

export const NavItem = ({
    isExpanded,
    isActive,
    organization,
    onExpand,
}: NavItemProps) => {
    const pathname = usePathname();

    const routes = [
        {
            label: "Boards",
            icon: Layout,
            href: `/organization/${organization.id}`,
        },
        {
            label: "Activity",
            icon: Activity,
            href: `/organization/${organization.id}/activity`,
        },
        {
            label: "Settings",
            icon: Settings,
            href: `/organization/${organization.id}/settings`,
        },
        {
            label: "Billing",
            icon: CreditCard,
            href: `/organization/${organization.id}/billing`,
        },
    ];

    return (
        <AccordionItem value={organization.id} className="border-none">
            <AccordionTrigger
                onClick={() => onExpand(organization.id)}
                className={cn(
                    "flex items-center gap-x-2 rounded-lg px-2 py-1.5 text-start text-foreground no-underline transition-colors hover:bg-accent hover:no-underline",
                    isActive && !isExpanded && "bg-secondary text-secondary-foreground"
                )}
            >
                <div className="flex items-center gap-x-2.5">
                    <div className="relative h-7 w-7 shrink-0">
                        <Image
                            fill
                            src={organization.imageUrl}
                            alt=""
                            className="rounded-md object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium">
                        {organization.name}
                    </span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-1">
                <ul className="space-y-0.5">
                    {routes.map(({ label, icon: Icon, href }) => {
                        const isCurrent = pathname === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={isCurrent ? "page" : undefined}
                                    className={cn(
                                        "flex h-9 items-center gap-x-2 rounded-md pl-11 pr-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isCurrent &&
                                            "bg-secondary font-medium text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" aria-hidden />
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </AccordionContent>
        </AccordionItem>
    );
};

NavItem.Skeleton = function SkeletonNavItem() {
    return (
        <div className="flex items-center gap-x-2">
            <div className="relative h-10 w-10 shrink-0">
                <Skeleton className="absolute h-full w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    );
};
