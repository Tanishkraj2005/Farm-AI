import { useState } from 'react';
import { PageProvider, usePage } from '../context/PageContext';

import Navbar           from '../components/Navbar';
import Footer           from '../components/Footer';
import ApiKeyModal      from '../components/ApiKeyModal';
import ToastContainer   from '../components/ToastContainer';
import Hero             from '../components/Hero';
import FarmerProfile    from '../components/FarmerProfile';
import WeatherWidget    from '../components/WeatherWidget';
import Chatbot          from '../components/Chatbot';
import CropSimulator    from '../components/CropSimulator';
import SoilAnalysis     from '../components/SoilAnalysis';
import DiseaseDetection from '../components/DiseaseDetection';
import MandiPrices      from '../components/MandiPrices';
import AgriNews         from '../components/AgriNews';
import CropCalendar     from '../components/CropCalendar';
import WasteToIncome    from '../components/WasteToIncome';
import Insurance        from '../components/Insurance';
import Glossary         from '../components/Glossary';

function PageRouter() {
  const { activePage } = usePage();

  const pages = {
    home:      <Hero />,
    profile:   <FarmerProfile />,
    weather:   <WeatherWidget />,
    chatbot:   <Chatbot />,
    simulator: <CropSimulator />,
    soil:      <SoilAnalysis />,
    disease:   <DiseaseDetection />,
    mandi:     <MandiPrices />,
    news:      <AgriNews />,
    calendar:  <CropCalendar />,
    waste:     <WasteToIncome />,
    insurance: <Insurance />,
    glossary:  <Glossary />,
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {pages[activePage] ?? <Hero />}
    </main>
  );
}

export default function Dashboard() {
  return (
    <PageProvider>
      <div className="flex flex-col min-h-screen">
        <ToastContainer />
        <ApiKeyModal />
        <Navbar />
        <PageRouter />
        <Footer />
      </div>
    </PageProvider>
  );
}
