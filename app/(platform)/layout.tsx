import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider appearance={clerkAppearance}>
            <QueryProvider>
                <Toaster position="bottom-right" closeButton />
                <ModalProvider />
                {children}
            </QueryProvider>
        </ClerkProvider>
    );
};

export default PlatformLayout;
