import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Navires from './pages/Navires';
import NavireDetail from './pages/NavireDetail';
import ChargesFonctionnement from './pages/ChargesFonctionnement';
import RapportMensuel from './pages/RapportMensuel';
import RapportAnnuel from './pages/RapportAnnuel';
import Parametres from './pages/Parametres';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/navires" element={<Navires />} />
        <Route path="/navires/:id" element={<NavireDetail />} />
        <Route path="/charges" element={<ChargesFonctionnement />} />
        <Route path="/rapports" element={<RapportMensuel />} />
        <Route path="/rapport-annuel" element={<RapportAnnuel />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
    </Layout>
  );
}

export default App;