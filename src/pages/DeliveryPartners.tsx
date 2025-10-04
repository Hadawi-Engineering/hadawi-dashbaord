import React from 'react';
import { Truck, Clock, Wrench } from 'lucide-react';
import Card from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';

export default function DeliveryPartners() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('deliveryPartners.title')}</h1>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <Truck className="w-12 h-12 text-primary-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('deliveryPartners.comingSoon')}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            {t('deliveryPartners.description')}
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('deliveryPartners.feature1.title')}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('deliveryPartners.feature1.description')}
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('deliveryPartners.feature2.title')}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('deliveryPartners.feature2.description')}
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('deliveryPartners.feature3.title')}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('deliveryPartners.feature3.description')}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('deliveryPartners.progress')}</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: '75%' }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="text-sm text-gray-500">
            {t('deliveryPartners.expectedLaunch')}
          </div>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('deliveryPartners.whatToExpect')}
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                <span>{t('deliveryPartners.expectation1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                <span>{t('deliveryPartners.expectation2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                <span>{t('deliveryPartners.expectation3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                <span>{t('deliveryPartners.expectation4')}</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('deliveryPartners.contactInfo')}
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>{t('deliveryPartners.contactDescription')}</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t('deliveryPartners.email')}:</span>
                <span className="text-primary-600">support@hadawi.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t('deliveryPartners.phone')}:</span>
                <span className="text-primary-600">+966 50 123 4567</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
