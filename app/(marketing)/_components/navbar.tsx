import { Logo } from "@/components/ui/logo"

const Navbar = () => {
    return (
        <div className="fixed top-0 w-full h-14 px-4 border-b
    shadow-sm bg-white flex items-center">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <Logo />
            </div>
        </div>
    )
}

export default Navbar