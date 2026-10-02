"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FleetSection from "@/components/FleetSection";
import PricingTable from "@/components/PricingTable";
import PopularRoutes from "@/components/PopularRoutes";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import BookingSuccessModal from "@/components/BookingSuccessModal";

export default function HomePage() {
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  const handleBookingSuccess = (bookingData: any) => {
    setSuccessBooking(bookingData);
  };

  const handleSelectCar = (carId: string) => {
    // Smooth scroll to booking form
    const bookingSection = document.getElementById("dat-xe");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectRoute = (from: string, to: string) => {
    // Smooth scroll to booking form
    const bookingSection = document.getElementById("dat-xe");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero with Instant Booking Box */}
      <Hero onBookingSuccess={handleBookingSuccess} />

      {/* Fleet Showcase */}
      <FleetSection onSelectCar={handleSelectCar} />

      {/* Popular Routes */}
      <PopularRoutes onSelectRoute={handleSelectRoute} />

      {/* Pricing Table & Interactive Calculator */}
      <PricingTable />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Floating Action Buttons (Hotline & Zalo & Scroll To Top & Mobile Bar) */}
      <FloatingWidgets />

      {/* Booking Success Modal */}
      {successBooking && (
        <BookingSuccessModal
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </main>
  );
}
