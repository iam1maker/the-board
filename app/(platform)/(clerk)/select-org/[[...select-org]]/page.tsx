import { OrganizationList } from "@clerk/nextjs";

export default function CreateOrganizationPage () {
    return (
        <OrganizationList
        afterSelectOrganizationUrl="/organization/:id"
        afterCreateOrganizationUrl="/organization/:id"
        hidePersonal
        />
    );
}