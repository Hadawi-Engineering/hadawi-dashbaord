import { useMemo, useState } from 'react';
import type { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchBar from '../ui/SearchBar';
import WhatsAppButton from '../WhatsAppButton';

interface RecipientSelectorProps {
  users: User[];
  sendToAll: boolean;
  selectedUserIds: string[];
  onSendToAllChange: (all: boolean) => void;
  onSelectedUsersChange: (ids: string[]) => void;
}

export default function RecipientSelector({
  users,
  sendToAll,
  selectedUserIds,
  onSendToAllChange,
  onSelectedUsersChange,
}: RecipientSelectorProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{t('notifications.recipient')}</label>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="recipient"
            checked={sendToAll}
            onChange={() => onSendToAllChange(true)}
            className="text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">{t('notifications.sendToAllUsers')}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="recipient"
            checked={!sendToAll}
            onChange={() => onSendToAllChange(false)}
            className="text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">{t('notifications.sendToSpecificUsers')}</span>
        </label>
      </div>

      {!sendToAll && (
        <div>
          <SearchBar
            placeholder={t('notifications.searchUsers')}
            onSearch={setSearch}
          />
          <div className="border rounded-lg p-2 max-h-48 overflow-y-auto mt-2">
            {filteredUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectedUsersChange([...selectedUserIds, user.id]);
                      } else {
                        onSelectedUsersChange(selectedUserIds.filter((id) => id !== user.id));
                      }
                    }}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm truncate">
                    {user.name} ({user.email})
                  </span>
                </div>
                {user.phone && (
                  <span
                    className="flex-shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <WhatsAppButton phone={user.phone} />
                  </span>
                )}
              </label>
            ))}
          </div>
          {selectedUserIds.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {t('notifications.selectedUsersList')}: {selectedUserIds.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
