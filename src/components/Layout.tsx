import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  CreditCard,
  Tag,
  Image,
  Wallet,
  Truck,
  Calculator,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Languages,
  ChevronDown,
  ChevronRight,
  Bell,
  Building2,
  Percent,
  Package2,
  Folder,
  Tags,
  Globe,
  MapPin,
} from 'lucide-react';
import adminService from '../services/adminService';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollLock } from '../hooks/useScrollLock';

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  children?: MenuItem[];
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useScrollLock(sidebarOpen);
  const [configOpen, setConfigOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const admin = adminService.getCurrentAdmin();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const handleLogout = () => {
    adminService.logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/users', icon: Users, label: t('nav.users') },
    { path: '/occasions', icon: Calendar, label: t('nav.occasions') },
    {
      path: '/catalog',
      icon: Package2,
      label: t('nav.catalog'),
      children: [
        { path: '/products', icon: Package2, label: t('nav.products') },
        { path: '/categories', icon: Folder, label: t('nav.categories') },
        { path: '/brands', icon: Tags, label: t('nav.brands') },
      ]
    },
    { path: '/payments', icon: CreditCard, label: t('nav.payments') },
    { path: '/promo-codes', icon: Tag, label: t('nav.promoCodes') },
    { path: '/banners', icon: Image, label: t('nav.banners') },
    { path: '/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/companies', icon: Building2, label: t('companies.title') },
    { path: '/offers', icon: Percent, label: t('offers.title') },
    { path: '/withdrawals', icon: Wallet, label: t('nav.withdrawals') },
    { path: '/delivery-partners', icon: Truck, label: t('nav.deliveryPartners') },
    { path: '/delivery-records', icon: Package, label: t('nav.deliveryRecords') },

    {
      path: '/locations',
      icon: Globe,
      label: t('nav.locations'),
      children: [
        { path: '/regions', icon: Globe, label: t('nav.regions') },
        { path: '/cities', icon: MapPin, label: t('nav.cities') },
      ]
    },

    {
      path: '/configuration',
      icon: Settings,
      label: t('nav.configuration'),
      children: [
        { path: '/occasion-types', icon: CalendarDays, label: t('nav.occasionTypes') },
        { path: '/taxes', icon: Calculator, label: t('nav.taxes') },
        { path: '/packaging', icon: Package, label: t('nav.packaging') },
      ]
    },
    { path: '/analytics', icon: BarChart3, label: t('nav.analytics') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
          } md:translate-x-0 bg-white ${isRTL ? 'border-l' : 'border-r'} border-gray-200`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex-shrink-0 px-7 py-4">
            <div className="flex items-center gap-3">
              <img
                src="https://www.hadawi.sa/assets/images/hadawi.png"
                alt="Hadawi Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-primary-600">Hadawi</h1>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isCatalogItem = item.path === '/catalog';
              const isConfigItem = item.path === '/configuration';
              const isLocationsItem = item.path === '/locations';
              const isCatalogActive = isCatalogItem && (location.pathname === '/products' || location.pathname === '/categories' || location.pathname === '/brands');
              const isConfigActive = isConfigItem && (location.pathname === '/occasion-types' || location.pathname === '/taxes' || location.pathname === '/packaging');
              const isLocationsActive = isLocationsItem && (location.pathname === '/regions' || location.pathname === '/cities');

              if (hasChildren) {
                const isOpen = isCatalogItem ? catalogOpen : isConfigItem ? configOpen : locationsOpen;
                const toggleOpen = isCatalogItem ? () => setCatalogOpen(!catalogOpen) : isConfigItem ? () => setConfigOpen(!configOpen) : () => setLocationsOpen(!locationsOpen);
                const isSubMenuActive = isCatalogItem ? isCatalogActive : isConfigItem ? isConfigActive : isLocationsActive;

                return (
                  <div key={item.path}>
                    <button
                      onClick={toggleOpen}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${isSubMenuActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      {isRTL ? (
                        isOpen ? <ChevronRight size={16} /> : <ChevronDown size={16} />
                      ) : (
                        isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>

                    {isOpen && (
                      <div className={`ml-4 ${isRTL ? 'mr-4' : 'ml-4'} space-y-1`}>
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${isActive(child.path)
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <ChildIcon size={16} />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Info - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {admin?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {admin?.name || admin?.email}
                </p>
                <p className="text-xs text-gray-500">{admin?.role || 'Admin'}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Languages size={16} />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50 md:hidden p-2 rounded-lg bg-white shadow-lg`}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`${isRTL ? 'md:mr-64' : 'md:ml-64'}`}>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

