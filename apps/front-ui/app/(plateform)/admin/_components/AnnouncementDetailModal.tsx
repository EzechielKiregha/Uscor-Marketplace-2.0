// app/admin/_components/AnnouncementDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Megaphone,
  Loader2,
  X,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMutation } from '@apollo/client';
import { CREATE_ANNOUNCEMENT } from '@/graphql/admin.gql';

interface AnnouncementDetailModalProps {
  announcement?: any;
  onClose: () => void;
  onCreate?: (announcement: any) => void;
  onUpdate?: (announcement: any) => void;
}

export default function AnnouncementDetailModal({
  announcement,
  onClose,
  onCreate,
  onUpdate
}: AnnouncementDetailModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    priority: 'MEDIUM',
    scheduledFor: '',
    targetUsers: 'ALL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [createAnnouncement] = useMutation(CREATE_ANNOUNCEMENT);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type || 'GENERAL',
        priority: announcement.priority || 'MEDIUM',
        scheduledFor: announcement.scheduledFor || '',
        targetUsers: announcement.targetUsers || 'ALL'
      });
    } else {
      // Default values for new announcement
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        priority: 'MEDIUM',
        scheduledFor: '',
        targetUsers: 'ALL'
      });
    }
  }, [announcement]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('error', 'Validation Error', 'Title and content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await createAnnouncement({
        variables: {
          input: {
            title: formData.title,
            content: formData.content,
            type: formData.type,
            priority: formData.priority,
            scheduledFor: formData.scheduledFor || null,
            targetUsers: formData.targetUsers
          }
        }
      });

      showToast('success', 'Success', 'Announcement created successfully');
      if (onCreate) onCreate(data.createAnnouncement);
      onClose();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to create announcement');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {announcement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {announcement
                  ? 'Update the details of this announcement'
                  : 'Create a new announcement for platform users'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter announcement title"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter announcement content"
                rows={6}
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border rounded-md"
                >
                  <option value="GENERAL">General</option>
                  <option value="PROMOTIONAL">Promotional</option>
                  <option value="SYSTEM">System</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border rounded-md"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            {/* Target Users */}
            <div>
              <label htmlFor="targetUsers" className="block text-sm font-medium mb-1">
                Target Users
              </label>
              <select
                id="targetUsers"
                name="targetUsers"
                value={formData.targetUsers}
                onChange={handleInputChange}
                className="w-full p-2 border border-border rounded-md"
              >
                <option value="ALL">All Users</option>
                <option value="BUSINESSES">Businesses Only</option>
                <option value="CLIENTS">Clients Only</option>
                <option value="VERIFIED">Verified Businesses</option>
                <option value="SUBSCRIBERS">Newsletter Subscribers</option>
              </select>
            </div>

            {/* Scheduling */}
            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Announcement
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  name="scheduledFor"
                  value={formData.scheduledFor ? formData.scheduledFor.split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = formData.scheduledFor ? formData.scheduledFor.split('T')[1] : '00:00';
                    setFormData(prev => ({
                      ...prev,
                      scheduledFor: date ? `${date}T${time}` : ''
                    }));
                  }}
                  className="flex-1"
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  type="time"
                  name="time"
                  value={formData.scheduledFor ? formData.scheduledFor.split('T')[1] : ''}
                  onChange={(e) => {
                    const date = formData.scheduledFor ? formData.scheduledFor.split('T')[0] : new Date().toISOString().split('T')[0];
                    const time = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      scheduledFor: time ? `${date}T${time}` : ''
                    }));
                  }}
                  className="flex-1"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to send immediately
              </p>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Preview</h3>
              </div>

              <div className="p-4">
                <div className={`p-4 rounded-lg ${formData.priority === 'LOW' ? 'bg-muted' :
                  formData.priority === 'MEDIUM' ? 'bg-warning/10' :
                    'bg-destructive/10'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${formData.priority === 'LOW' ? 'text-muted-foreground' :
                      formData.priority === 'MEDIUM' ? 'text-warning' :
                        'text-destructive'
                      }`}>
                      {formData.priority === 'LOW' && <Megaphone className="h-5 w-5" />}
                      {formData.priority === 'MEDIUM' && <AlertTriangle className="h-5 w-5" />}
                      {formData.priority === 'HIGH' && <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{formData.title || 'Announcement Title'}</h4>
                      <p className="text-sm mt-1">
                        {formData.content
                          ? formData.content.substring(0, 100) + (formData.content.length > 100 ? '...' : '')
                          : 'Announcement content will appear here...'}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formData.type}</span>
                        <span>•</span>
                        <span>{formData.targetUsers === 'ALL' ? 'All Users' : formData.targetUsers}</span>
                        {formData.scheduledFor && (
                          <>
                            <span>•</span>
                            <span>Scheduled for {new Date(formData.scheduledFor).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* East Africa Information */}
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">East Africa Announcement Tips</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When creating announcements for East African users, consider the following:
                  </p>

                  <ul className="mt-2 space-y-1 pl-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                      <span>Use Swahili or local languages for broader reach in certain regions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                      <span>Mention mobile money payment options prominently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                      <span>Schedule announcements for morning hours (7-10 AM) for maximum visibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleCreateAnnouncement}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {announcement ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  announcement ? 'Update Announcement' : 'Create Announcement'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}