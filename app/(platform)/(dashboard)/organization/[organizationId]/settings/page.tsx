import { OrganizationProfile } from "@clerk/nextjs";

const Settings = () => {
    return (
        <div className="mb-20 w-full">
            <OrganizationProfile
                appearance={{
                    elements: {
                        rootBox: {
                            width: "100%",
                        },
                        card: {
                            width: "100%",
                            maxWidth: "100%",
                            boxShadow: "none",
                            border: "1px solid hsl(var(--border))",
                        },
                    },
                }}
            />
        </div>
    );
};
export default Settings;
