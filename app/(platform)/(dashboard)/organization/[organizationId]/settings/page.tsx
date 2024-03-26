import { OrganizationProfile } from "@clerk/nextjs"

const Settings = () => {
    return (
        <div>
            <OrganizationProfile
            appearance={{
                elements: {
                    rootBox: {
                        boxShadow: "none",
                        width: "100%",
                    },
                    card:{
                        border:"1px solid",
                        boxShadow: "none",
                        width:"100%"
                    }
                },
            }}
            />
        </div>
    )
}
export default Settings