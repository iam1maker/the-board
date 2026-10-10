import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Logo />
                <nav className="flex items-center gap-x-2">
                    <Button size="sm" variant="ghost" asChild>
                        <Link href="/sign-in">Log in</Link>
                    </Button>
                    <Button size="sm" variant="primary" asChild>
                        <Link href="/sign-up">Get started</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
