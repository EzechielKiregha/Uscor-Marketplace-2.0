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
  X,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FREELANCE_SERVICE_BY_ID } from '@/graphql/freelance-service.gql';
import { CREATE_CHAT } from '@/graphql/chat.gql';

interface ServiceDetailsModalProps {
  service: any;
  onClose: () => void;
  onChat: () => void;
}

export default function ServiceDetailsModal({
  service,
  onClose,
  onChat
}: ServiceDetailsModalProps) {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
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

  const handleBookService = () => {
    // In a real app, this would create a booking
    showToast('success', 'Booking Requested', 'Your service booking has been requested. The business will confirm shortly.');
    onClose();

    // Navigate to bookings
    setTimeout(() => {
      window.location.href = '/client?tab=orders';
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{service.title}</h2>
              <p className="text-muted-foreground mt-1">
                {service.business.name}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Service Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                {service.medias && service.medias.length > 0 ? (
                  <img
                    src={service.medias[0].url}
                    alt={service.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-6xl">
                    {getServiceCategoryIcon()}
                  </div>
                )}

                {/* Service Category Badge */}
                <div className="absolute bottom-4 left-4 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium">
                  {service.category === 'DESIGN' && 'Design & Creative'}
                  {service.category === 'DEV' && 'Development'}
                  {service.category === 'PLUMBER' && 'Plumbing'}
                  {service.category === 'ELECTRICIAN' && 'Electrical'}
                  {service.category === 'CARPENTER' && 'Carpentry'}
                  {service.category === 'MECHANIC' && 'Mechanics'}
                  {service.category === 'TUTOR' && 'Tutoring'}
                </div>
              </div>
            </div>

            {/* Right Column - Service Details */}
            <div className="space-y-6">
              {/* Business Info */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                    {getBusinessTypeIcon()}
                  </div>
                  <div>
                    <h3 className="font-medium">{service.business.name}</h3>
                    {service.business.kycStatus === 'VERIFIED' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Business
                      </span>
                    )}
                  </div>
                </div>

                {service.business.address && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{service.business.address}</span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onChat}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat About Service
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => window.location.href = `/b-view/${service.business.id}`}
                  >
                    View Business
                  </Button>
                </div>
              </div>

              {/* Service Price */}
              <div>
                <p className="text-3xl font-bold">
                  {service.isHourly ? `$${service.rate}/hr` : `$${service.rate} fixed`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {service.isHourly
                    ? 'Price may vary based on project complexity and duration'
                    : 'Includes standard service features'}
                </p>
              </div>

              {/* Service Description */}
              {service.description && (
                <div>
                  <h3 className="font-semibold mb-2">About this service</h3>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Workers Selection */}
              {service.workerServiceAssignments && service.workerServiceAssignments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Service Providers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.workerServiceAssignments.map((assignment: any) => (
                      <div
                        key={assignment.worker.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedWorker === assignment.worker.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => setSelectedWorker(assignment.worker.id)}
                      >
                        <div className="flex items-center gap-3">
                          {assignment.worker.avatar ? (
                            <img
                              src={assignment.worker.avatar}
                              alt={assignment.worker.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                              {assignment.worker.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{assignment.worker.fullName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Book This Service</h3>

                <div className="space-y-4">
                  {/* <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 border border-border rounded-md"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Select Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-2 border border-border rounded-md"
                      disabled={!selectedDate}
                    >
                      <option value="">Select a time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium mb-1">Before you book, tell us what you need</label>
                    <textarea
                      className="w-full p-2 border border-border rounded-md"
                      rows={3}
                      placeholder="Tell us about your specific needs or requirements..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 text-lg"
                  onClick={handleBookService}
                >
                  Fill the Service Request Form
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 text-lg"
                  onClick={onChat}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat About Service
                </Button>
              </div>

              {/* Business Type Specific Information */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Service Information</h3>

                    {service.business.businessType === 'HARDWARE' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Hardware service providers typically respond to booking requests within 24 hours.
                        For urgent issues like plumbing or electrical problems, indicate "URGENT" in your
                        notes for priority response.
                      </p>
                    )}

                    {service.business.businessType === 'TRANSPORTATION' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Transportation services require at least 24 hours notice for booking. Same-day
                        requests may be accommodated based on availability. Please specify pickup
                        location and destination in your notes.
                      </p>
                    )}

                    {service.business.businessType === 'ARTISAN' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Artisans typically require consultation before booking custom work. Use the
                        chat feature to discuss your project requirements and get a more accurate
                        timeline and price estimate.
                      </p>
                    )}

                    {(service.business.businessType !== 'HARDWARE' &&
                      service.business.businessType !== 'TRANSPORTATION' &&
                      service.business.businessType !== 'ARTISAN') && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Service providers typically respond to booking requests within 24 hours.
                          For urgent requests, please indicate this in your notes for priority attention.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}