import { Logo } from "@/components/ui/logo";

const ClerkLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-full flex-col items-center justify-center gap-y-8 bg-gradient-to-b from-secondary to-background px-4 py-12">
            <Logo />
            {children}
        </div>
    );
};

export default ClerkLayout;
