import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationPreviewProps {
  title: string;
  body: string;
  imageUrl?: string;
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export default function NotificationPreview({ title, body, imageUrl }: NotificationPreviewProps) {
  const { t, isRTL } = useLanguage();
  const rtl = isRTL || hasArabic(title) || hasArabic(body);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500 mb-3">{t('notifications.preview')}</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-sm">
        {imageUrl && (
          <img src={imageUrl} alt="" className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="p-3" dir={rtl ? 'rtl' : 'ltr'}>
          <p className="font-semibold text-gray-900 text-sm">{title || '—'}</p>
          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{body || '—'}</p>
        </div>
      </div>
    </div>
  );
}
