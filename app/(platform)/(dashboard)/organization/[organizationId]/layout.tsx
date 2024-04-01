import { OrgControl } from "./_components/orgcontrol"

const OrganizationIdLayout = ({ children }: {
    children: React.ReactNode
}) => {
    return (
        <>
            <OrgControl />
            {children}
        </>
    )
}

export default OrganizationIdLayout