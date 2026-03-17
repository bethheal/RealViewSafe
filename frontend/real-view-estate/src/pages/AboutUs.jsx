import React from "react";
import AboutSection from "../components/AboutSection";
import Seo from "../components/Seo";

export default function AboutUs() {
  return (
    <>
      <Seo
        title="About Us - RealViewEstate"
        description="Learn about Real View Estate and Construction Agency, our mission, vision, leadership, and services across Ghana."
        pathname="/about-us"
      />
      <AboutSection />
    </>
  );
}
