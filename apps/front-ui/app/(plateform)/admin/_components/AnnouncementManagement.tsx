// app/admin/_components/AnnouncementManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ANNOUNCEMENTS,
  CREATE_ANNOUNCEMENT
} from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Megaphone,
  Filter,
  Loader2,
  CheckCircle,
  X,
  Calendar,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import AnnouncementDetailModal from './AnnouncementDetailModal';
import { useToast } from '@/components/toast-provider';
import Loader from '@/components/seraui/Loader';

interface AnnouncementManagementProps {
  // Optional props if needed
}

export default function AnnouncementManagement({ }: AnnouncementManagementProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const {
    data: announcementsData,
    loading: announcementsLoading,
    error: announcementsError,
    refetch
  } = useQuery(GET_ANNOUNCEMENTS, {
    variables: {
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      page,
      limit: 10
    }
  });

  const [createAnnouncement] = useMutation(CREATE_ANNOUNCEMENT);

  const announcements = announcementsData?.announcements?.items || [];
  const totalAnnouncements = announcementsData?.announcements?.total || 0;
  const totalPages = Math.ceil(totalAnnouncements / 10);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (announcementsLoading) return <Loader loading={true} />;
  if (announcementsError) return <div>Error loading announcements: {announcementsError.message}</div>;

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search announcements..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
          <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SENT">Sent</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <Button
            variant="default"
            onClick={() => setShowCreateModal(true)}
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        </div>
      </div>

      {/* Announcement Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left p-4 font-semibold">Title</th>
              <th className="text-left p-4 font-semibold">Priority</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Recipients</th>
              <th className="text-left p-4 font-semibold">Scheduled</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No announcements found matching your criteria
                </td>
              </tr>
            ) : (
              announcements.map((announcement: any) => (
                <tr
                  key={announcement.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium truncate">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {announcement.content}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${announcement.priority === 'LOW' ? 'bg-muted' :
                      announcement.priority === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                      {announcement.priority}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${announcement.status === 'DRAFT' ? 'bg-muted' :
                      announcement.status === 'SCHEDULED' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                      {announcement.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{announcement.readCount}/{announcement.totalRecipients}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>
                        {announcement.scheduledFor
                          ? new Date(announcement.scheduledFor).toLocaleDateString()
                          : 'Immediately'}
                      </span>
                      {announcement.scheduledFor && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.scheduledFor).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedAnnouncement(announcement)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalAnnouncements > 10 && (
        <div className="p-4 bg-muted border-t border-border flex justify-between items-center">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <AnnouncementDetailModal
          onClose={() => setShowCreateModal(false)}
          onCreate={refetch}
        />
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}