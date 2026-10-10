import { Logo } from "@/components/ui/logo";

const Footer = () => {
    return (
        <footer className="border-t bg-card">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
                <Logo />
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Taskify. Built with Next.js.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
