import React, { useState, useEffect } from "react";
import { BackgroundGradient, Navbar, HeroSection, LogosSection, BentoGrid, WorkflowSection, CallToAction, StatsSection, IntegrationsSection, PricingSection, TestimonialSection, FAQSection, GooTeam, GooNewsletter } from "../components/CoreLandingPages/StartupLandingPages/tsx/Goo";

export default function GooPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-indigo-500/30 selection:text-white">
            <BackgroundGradient />
            <Navbar />
            <HeroSection />
            <LogosSection />
            <BentoGrid />
            <WorkflowSection />
            <StatsSection />
            <IntegrationsSection />
            <PricingSection />
            <TestimonialSection />
            <FAQSection />
            <GooTeam />
            <GooNewsletter />
            <CallToAction />
        </main>
    );
}
