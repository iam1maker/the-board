import { OrgControl } from "./_components/orgcontrol"

const OrganizationIdLayout = ({ children }: {
    children: React.ReactNode
}) => {
    return (
        <div>
            <OrgControl/>
            {children}
            </div>
    )
}

export default OrganizationIdLayout