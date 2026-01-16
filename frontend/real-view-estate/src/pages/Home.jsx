import React from 'react'
import WhyBest from "../components/WhyBest";
import PropertiesSection from '../components/PropertiesSection';
import Contact from '../components/Contact';
import FAQ from '../components/faq';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhyBest />
      <PropertiesSection/>
      <FAQ/>
      <Contact/>
      <Footer/>
    </>
  );
}
