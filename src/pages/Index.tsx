import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectorsSection from "@/components/SectorsSection";
import CertificationSection from "@/components/CertificationSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SectorsSection />
      <CertificationSection />
      <Footer />
    </div>
  );
};

export default Index;
