import { Plus } from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { FormPopover } from "@/components/form/form-popover";
import { Logo } from "@/components/ui/logo";

import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 z-50 flex h-14 w-full items-center border-b bg-card/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <MobileSidebar />
            <div className="flex items-center gap-x-4">
                <Logo className="hidden md:flex" />
                <FormPopover align="start" side="bottom" sideOffset={18}>
                    <Button
                        variant="primary"
                        size="sm"
                        className="h-8 px-3"
                        aria-label="Create board"
                    >
                        <Plus className="h-4 w-4" aria-hidden />
                        <span className="hidden md:inline">Create</span>
                    </Button>
                </FormPopover>
            </div>
            <div className="ml-auto flex items-center gap-x-3">
                <OrganizationSwitcher
                    hidePersonal
                    afterCreateOrganizationUrl="/organization/:id"
                    afterSelectOrganizationUrl="/organization/:id"
                    afterLeaveOrganizationUrl="/select-org"
                    appearance={{
                        elements: {
                            rootBox: {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            },
                        },
                    }}
                />
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: {
                                height: 32,
                                width: 32,
                            },
                        },
                    }}
                />
            </div>
        </nav>
    );
};
