import Footer from "./_components/footer";
import Navbar from "./_components/navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-full flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};
export default MarketingLayout;
