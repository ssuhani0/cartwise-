import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ShopListing from '@/pages/ShopListing';
import NearbyShops from '@/pages/NearbyShops';
import ShopDetail from '@/pages/ShopDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import OcrPage from '@/pages/OcrPage';
import AiAssistant from '@/pages/AiAssistant';
import Profile from '@/pages/Profile';
import DeliveryDashboardPage from '@/pages/DeliveryDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { syncCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/delivery/*" element={<DeliveryDashboardPage />} />
        <Route path="/admin/*" element={<AdminDashboardPage />} />
        <Route path="/*" element={<MainRoutes />} />
      </Routes>
    </ErrorBoundary>
  );
}

function MainRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/shops" element={<ShopListing />} />
        <Route path="/nearby" element={<NearbyShops />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/ocr" element={<OcrPage />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}
