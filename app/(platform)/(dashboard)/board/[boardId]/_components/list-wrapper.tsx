interface ListWrapperProps {
    children: React.ReactNode;
}

export const ListWrapper = ({ children }: ListWrapperProps) => {
    return (
        <li className="h-full w-[280px] shrink-0 select-none">{children}</li>
    );
};
