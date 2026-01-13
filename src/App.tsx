import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Occasions from './pages/Occasions';
import OccasionDetails from './pages/OccasionDetails';
import OccasionTypes from './pages/OccasionTypes';
import Payments from './pages/Payments';
import PromoCodes from './pages/PromoCodes';
import Banners from './pages/Banners';
import Notifications from './pages/Notifications';
import Withdrawals from './pages/Withdrawals';
import DeliveryPartners from './pages/DeliveryPartners';
import Taxes from './pages/Taxes';
import Packaging from './pages/Packaging';
import DeliveryRecords from './pages/DeliveryRecords';
import Companies from './pages/Companies';
import Offers from './pages/Offers';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Regions } from './pages/Regions';
import { Cities } from './pages/Cities';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="occasions" element={<Occasions />} />
        <Route path="occasions/:occasionId" element={<OccasionDetails />} />
        <Route path="occasion-types" element={<OccasionTypes />} />
        <Route path="payments" element={<Payments />} />
        <Route path="promo-codes" element={<PromoCodes />} />
        <Route path="banners" element={<Banners />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="delivery-partners" element={<DeliveryPartners />} />
        <Route path="delivery-records" element={<DeliveryRecords />} />
        <Route path="regions" element={<Regions />} />
        <Route path="cities" element={<Cities />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="packaging" element={<Packaging />} />
        <Route path="companies" element={<Companies />} />
        <Route path="offers" element={<Offers />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;

