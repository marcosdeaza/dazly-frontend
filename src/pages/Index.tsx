import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImageCarousel from "@/components/ImageCarousel";
import FeatureShowcase from "@/components/FeatureShowcase";
import InfinitePitch from "@/components/InfinitePitch";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <ImageCarousel />
      <FeatureShowcase />
      <InfinitePitch />
      <Footer />
    </div>
  );
};

export default Index;
