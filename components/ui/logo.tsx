import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    href?: string;
}

export const Logo = ({ className, href = "/" }: LogoProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-x-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className
            )}
        >
            <Image src="/logo.svg" alt="" height={28} width={28} priority />
            <span className="text-lg font-bold tracking-tight text-foreground">
                Taskify
            </span>
        </Link>
    );
};
