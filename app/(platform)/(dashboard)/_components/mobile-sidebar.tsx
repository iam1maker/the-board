"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export const MobileSidebar = () => {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    const onOpen = useMobileSidebar((state) => state.onOpen);
    const onClose = useMobileSidebar((state) => state.onClose);
    const isOpen = useMobileSidebar((state) => state.isOpen);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <Button
                onClick={onOpen}
                className="mr-2 md:hidden"
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
            >
                <Menu className="h-5 w-5" aria-hidden />
            </Button>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="p-3 pt-12">
                    <Sidebar storageKey="t-sidebar-mobile-state" />
                </SheetContent>
            </Sheet>
        </>
    );
};
