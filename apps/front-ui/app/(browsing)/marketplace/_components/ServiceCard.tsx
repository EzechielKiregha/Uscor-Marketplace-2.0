'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  Gift,
  BriefcaseBusiness,
  MessageSquare,
  Users,
  Loader2,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import ServiceDetailsModal from './ServiceDetailsModal';
import { useMutation } from '@apollo/client';
import { CREATE_CHAT } from '@/graphql/chat.gql';

interface ServiceCardProps {
  service: any;
  viewMode: 'grid' | 'list';
}

export default function ServiceCard({ service, viewMode }: ServiceCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { showToast } = useToast();

  // Get business type icon
  const getBusinessTypeIcon = () => {
    switch (service.business.businessType) {
      case 'ARTISAN':
        return '🎨';
      case 'BOOKSTORE':
        return '📚';
      case 'ELECTRONICS':
        return '🔌';
      case 'HARDWARE':
        return '🔨';
      case 'GROCERY':
        return '🛒';
      case 'CAFE':
        return '☕';
      case 'RESTAURANT':
        return '🍽️';
      case 'RETAIL':
        return '🏬';
      case 'BAR':
        return '🍷';
      case 'CLOTHING':
        return '👕';
      default:
        return '🏢';
    }
  };

  // Get service category icon
  const getServiceCategoryIcon = () => {
    switch (service.category) {
      case 'DESIGN':
        return <span className="text-3xl">🎨</span>;
      case 'DEV':
        return <span className="text-3xl">💻</span>;
      case 'PLUMBER':
        return <span className="text-3xl">🔧</span>;
      case 'ELECTRICIAN':
        return <span className="text-3xl">⚡</span>;
      case 'CARPENTER':
        return <span className="text-3xl">🪵</span>;
      case 'MECHANIC':
        return <span className="text-3xl">🚗</span>;
      case 'TUTOR':
        return <span className="text-3xl">🧑‍🏫</span>;
      default:
        return <span className="text-3xl">🛠️</span>;
    }
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const [createChat, { loading: chatLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
      showToast('success', 'Chat Opened', 'You can now chat with the business about this service');

      // Navigate to chat
      setTimeout(() => {
        window.location.href = `/chats?businessId=${service.business.id}&serviceId=${service.id}`;
      }, 1000);
    },
    onError: (error) => {
      showToast(
        'error',
        'Failed ',
        error.message,
        true,
        8000,
        'bottom-right'
      )
    },
  });

  const handleStartChat = () => {

  };

  const handleChat = () => {
    // In a real app, this would open a chat with the business
    createChat({
      variables: {
        createChatInput: {
          serviceId: service.id,
          status: 'OPEN',
          isSecure: false,
          negotiationType: 'FREELANCE',
        },
      },
    });
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
          {/* Service Image */}
          <div className="h-48 bg-muted relative">
            {service.medias && service.medias.length > 0 ? (
              <img
                src={service.medias[0].url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                {getServiceCategoryIcon()}
              </div>
            )}

            {/* Service Category Badge */}
            <div className="absolute bottom-2 left-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {service.category === 'DESIGN' && 'Design & Creative'}
              {service.category === 'DEV' && 'Development'}
              {service.category === 'PLUMBER' && 'Plumbing'}
              {service.category === 'ELECTRICIAN' && 'Electrical'}
              {service.category === 'CARPENTER' && 'Carpentry'}
              {service.category === 'MECHANIC' && 'Mechanics'}
              {service.category === 'TUTOR' && 'Tutoring'}
            </div>
          </div>

          <div className="p-4">
            {/* Business Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                {getBusinessTypeIcon()}
              </div>
              <div>
                <h3 className="font-medium text-sm truncate">{service.business.name}</h3>
                {service.business.kycStatus === 'VERIFIED' && (
                  <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Service Title */}
            <h4 className="font-medium mb-1 line-clamp-1">{service.title}</h4>

            {/* Service Description */}
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {service.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-3">
              <p className="font-bold text-lg">
                {service.isHourly ? `$${service.rate}/hr` : `$${service.rate} fixed`}
              </p>
            </div>

            {/* Workers */}
            {service.workerServiceAssignments && service.workerServiceAssignments.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {service.workerServiceAssignments.slice(0, 3).map((assignment: any, index: number) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
                      title={assignment.worker.fullName}
                    >
                      {assignment.worker.avatar ? (
                        <img
                          src={assignment.worker.avatar}
                          alt={assignment.worker.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                          {assignment.worker.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {service.workerServiceAssignments.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      +{service.workerServiceAssignments.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleChat}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Service Details Modal */}
        {showDetails && (
          <ServiceDetailsModal
            service={service}
            onClose={() => setShowDetails(false)}
            onChat={handleChat}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col md:flex-row">
        {/* Service Image */}
        <div className="md:w-48 h-32 md:h-auto bg-muted relative">
          {service.medias && service.medias.length > 0 ? (
            <img
              src={service.medias[0].url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              {getServiceCategoryIcon()}
            </div>
          )}

          {/* Service Category Badge */}
          <div className="absolute bottom-2 left-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
            {service.category === 'DESIGN' && 'Design & Creative'}
            {service.category === 'DEV' && 'Development'}
            {service.category === 'PLUMBER' && 'Plumbing'}
            {service.category === 'ELECTRICIAN' && 'Electrical'}
            {service.category === 'CARPENTER' && 'Carpentry'}
            {service.category === 'MECHANIC' && 'Mechanics'}
            {service.category === 'TUTOR' && 'Tutoring'}
          </div>
        </div>

        <div className="p-4 flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              {/* Business Info */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                  {getBusinessTypeIcon()}
                </div>
                <h3 className="font-medium text-sm">{service.business.name}</h3>
                {service.business.kycStatus === 'VERIFIED' && (
                  <ShieldCheck className="h-4 w-4 text-primary ml-1" />
                )}
              </div>

              {/* Service Title */}
              <h4 className="font-medium mb-1 line-clamp-1">{service.title}</h4>

              {/* Service Description */}
              {service.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {service.description}
                </p>
              )}

              {/* Business Address */}
              {service.business.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{service.business.address}</span>
                </div>
              )}

              {/* Workers */}
              {service.workerServiceAssignments && service.workerServiceAssignments.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {service.workerServiceAssignments.slice(0, 3).map((assignment: any, index: number) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
                        title={assignment.worker.fullName}
                      >
                        {assignment.worker.avatar ? (
                          <img
                            src={assignment.worker.avatar}
                            alt={assignment.worker.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                            {assignment.worker.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                    {service.workerServiceAssignments.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        +{service.workerServiceAssignments.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              {/* Price */}
              <div className="mb-2">
                <p className="font-bold text-lg">
                  {service.isHourly ? `$${service.rate}/hr` : `$${service.rate} fixed`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleChat}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {showDetails && (
        <ServiceDetailsModal
          service={service}
          onClose={() => setShowDetails(false)}
          onChat={handleChat}
        />
      )}
    </>
  );
}