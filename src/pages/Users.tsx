import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Ban, Trash2, UserCheck } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Users() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => adminService.getUsers({ page, limit: 20, search }),
  });

  // Block/Unblock mutation
  const blockMutation = useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) =>
      adminService.blockUser(userId, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleViewUser = async (userId: string) => {
    try {
      const user = await adminService.getUser(userId);
      setSelectedUser(user);
      setShowModal(true);
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
    if (confirm(`${t('common.confirm')} ${currentlyBlocked ? t('users.unblock') : t('users.block')}?`)) {
      try {
        await blockMutation.mutateAsync({ userId, isBlocked: !currentlyBlocked });
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm(t('users.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(userId);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {t('common.error')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
        <div className="text-sm text-gray-500">
          {t('users.count')}: {users?.length || 0}
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <SearchBar
            placeholder={t('users.searchPlaceholder')}
            onSearch={handleSearch}
          />
        </div>

        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('common.email')}</Table.Th>
              <Table.Th>{t('common.phone')}</Table.Th>
              <Table.Th>{t('common.city')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('users.registrationDate')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {users?.map((user) => (
              <Table.Row key={user.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">{user.name}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">{user.email}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600" dir="ltr">{user.phone}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">{user.city || '-'}</div>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.isBlocked ? 'red' : 'green'}>
                    {user.isBlocked ? t('users.blocked') : t('common.active')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewUser(user.id)}
                      title={t('common.view')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant={user.isBlocked ? 'success' : 'outline'}
                      onClick={() => handleBlockUser(user.id, user.isBlocked)}
                      title={user.isBlocked ? t('users.unblock') : t('users.block')}
                    >
                      {user.isBlocked ? <UserCheck size={16} /> : <Ban size={16} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Pagination - assuming 20 items per page */}
        {users && users.length >= 20 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(page + 1, 10)} // Estimate total pages
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          title={t('users.details')}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('common.name')}</p>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.email')}</p>
                <p className="font-medium text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                <p className="font-medium text-gray-900" dir="ltr">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.city')}</p>
                <p className="font-medium text-gray-900">{selectedUser.city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('users.birthDate')}</p>
                <p className="font-medium text-gray-900">
                  {selectedUser.birthDate 
                    ? new Date(selectedUser.birthDate).toLocaleDateString()
                    : '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('users.gender')}</p>
                <p className="font-medium text-gray-900">{selectedUser.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('users.occasionsCount')}</p>
                <p className="font-medium text-gray-900">{selectedUser.occasionsCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('users.paymentsCount')}</p>
                <p className="font-medium text-gray-900">{selectedUser.paymentsCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.status')}</p>
                <Badge color={selectedUser.isBlocked ? 'red' : 'green'}>
                  {selectedUser.isBlocked ? t('users.blocked') : t('common.active')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('users.registrationDate')}</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant={selectedUser.isBlocked ? 'success' : 'outline'}
                onClick={() => {
                  handleBlockUser(selectedUser.id, selectedUser.isBlocked);
                  setShowModal(false);
                }}
                className="flex-1"
              >
                {selectedUser.isBlocked ? t('users.unblock') : t('users.block')}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteUser(selectedUser.id);
                  setShowModal(false);
                }}
                className="flex-1"
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
