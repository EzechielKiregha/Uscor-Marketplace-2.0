// app/business/[id]/_components/WorkersSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Users,
  Filter,
  Search,
  Star,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkersSectionProps {
  workers: any[];
  loading: boolean;
  business: any;
}

export default function WorkersSection({
  workers,
  loading,
  business
}: WorkersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Extract unique roles from workers
  const roles = Array.from(
    new Set(workers.map(worker => worker.role).filter(Boolean))
  );

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole ? worker.role === selectedRole : true;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredWorkers.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No workers found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedRole
              ? 'Try adjusting your search or filter criteria'
              : 'This business has not added any workers yet'}
          </p>

          {(searchQuery || selectedRole) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRole(null)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedRole ? selectedRole : 'All Roles'}
            </Button>
            {roles.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="w-full px-4 py-2 text-left hover:bg-muted"
                  >
                    All Roles
                  </button>
                  {roles.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className="w-full px-4 py-2 text-left hover:bg-muted"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 text-center bg-muted border-b border-border">
                <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2 border-border">
                  {worker.avatar ? (
                    <img
                      src={worker.avatar}
                      alt={worker.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold">
                      {worker.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-lg">{worker.fullName}</h3>
                {worker.role && (
                  <p className="text-sm text-muted-foreground mt-1">{worker.role}</p>
                )}
              </div>

              <div className="p-4">
                {worker.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {worker.bio}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-warning mr-1" />
                    <span className="text-sm">4.7 (42)</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                </div>

                {worker.specialties && worker.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {worker.specialties.slice(0, 3).map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {worker.specialties.length > 3 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        +{worker.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Type Specific Information */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">About {business.name}'s Team</h4>
            {business.businessType === 'HARDWARE' && (
              <p className="text-sm text-muted-foreground mt-1">
                {business.name} has a team of certified technicians and hardware specialists
                ready to assist with all your tool and equipment needs. Their staff is trained
                in the latest hardware technologies and can provide expert advice on product selection.
              </p>
            )}
            {business.businessType === 'TRANSPORTATION' && (
              <p className="text-sm text-muted-foreground mt-1">
                {business.name} employs experienced drivers who are familiar with the local
                area and traffic patterns. All drivers undergo regular safety training and
                vehicle maintenance checks to ensure safe and timely deliveries.
              </p>
            )}
            {business.businessType === 'ARTISAN' && (
              <p className="text-sm text-muted-foreground mt-1">
                {business.name} is staffed by skilled artisans and craftspeople with years of
                experience in their respective fields. Each team member brings unique expertise
                to create high-quality, handcrafted products for customers.
              </p>
            )}
            {(business.businessType !== 'HARDWARE' &&
              business.businessType !== 'TRANSPORTATION' &&
              business.businessType !== 'ARTISAN') && (
                <p className="text-sm text-muted-foreground mt-1">
                  {business.name} has a dedicated team of professionals ready to serve you.
                  Their staff is trained to provide excellent customer service and expertise
                  in their field.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}