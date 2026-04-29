import React from 'react';
import Navbar from '../components/Navbar';
import LotrHeroBanner from '../components/LotrHeroBanner';
import FeatureStrip from '../components/FeatureStrip';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#111111] font-sans selection:bg-[#C9A227]/30 selection:text-[#F8F6F0]"
    >
      <Navbar />
      <LotrHeroBanner />
      <FeatureStrip />
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
