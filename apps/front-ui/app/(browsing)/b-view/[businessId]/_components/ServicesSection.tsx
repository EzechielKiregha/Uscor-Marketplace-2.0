// app/business/[id]/_components/ServicesSection.tsx
"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FreelanceServiceEntity } from "@/lib/types";
import {
    Box,
    BriefcaseBusiness,
    Coins,
    Filter,
    Grid,
    Hammer,
    List, LucideIcon,
    MessageSquare,
    Palette,
    Search,
    Star,
    Truck,
    Users,
    Wrench,
} from "lucide-react";
import { useState } from "react";

// Map service categories to icons (Lucide icons)
const SERVICE_CATEGORY_ICONS: Record<string, LucideIcon> = {
  WOODWORKING: Hammer,
  METALWORKING: Wrench,
  REPAIR: Wrench,
  CUSTOM_MAKING: Palette,
  INSTALLATION: Box,
  TRANSPORTATION: Truck,
  CONSULTATION: MessageSquare,
};

interface ServicesSectionProps {
  services: FreelanceServiceEntity[];
  loading: boolean;
  business: any;
}

export default function ServicesSection({
  services,
  loading,
  business,
}: ServicesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { showToast } = useToast();

  // Extract unique categories from services
  const categories = Array.from(
    new Set(services.map((service) => service.category).filter(Boolean)),
  );

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? service.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-card border hover:border-primary  rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="bg-card border hover:border-primary  rounded-lg p-6">
        <EmptyState
          icon={emptyStateIcons.search}
          title="No services found"
          description={searchQuery || selectedCategory
            ? "Try adjusting your search or filter criteria"
            : "This business has not added any services yet"}
          action={(searchQuery || selectedCategory) ? {
            label: "Clear Filters",
            onClick: () => {
              setSearchQuery("");
              setSelectedCategory(null);
            },
            variant: "outline",
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border hover:border-primary  rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search services..."
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
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedCategory ? selectedCategory : "All Categories"}
            </Button>
            {categories.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-card border hover:border-primary  rounded-md shadow-lg z-10 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-full px-4 py-2 text-left hover:bg-muted"
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full px-4 py-2 text-left hover:bg-muted"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex border hover:border-primary  rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      {viewMode === "grid" ? (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const CategoryIcon =
                SERVICE_CATEGORY_ICONS[service.category] || BriefcaseBusiness;

              <CategoryIcon className="h-4 w-4 text-muted-foreground" />;

              return (
                <div
                  key={service.id}
                  className="border hover:border-primary  rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 bg-muted border-b border-border">
                    <div className="flex items-center gap-2">
                      {CategoryIcon && (
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      )}
                      <h3 className="font-medium truncate">{service.title}</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description || "No description provided"}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {service.isHourly
                            ? `$${service.rate}/hr`
                            : `$${service.rate} fixed`}
                        </span>
                      </div>

                      {service.workerServiceAssignments &&
                        service.workerServiceAssignments.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div className="flex -space-x-2">
                              {service.workerServiceAssignments
                                .slice(0, 3)
                                .map((assignment: any, index: number) => (
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

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-warning mr-1" />
                        <span className="text-sm">{service.averageRating?.toFixed(1) || "New"}</span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          showToast("info", "Coming Soon", "Service booking is not yet available")
                        }
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredServices.map((service) => {
            const CategoryIcon =
              SERVICE_CATEGORY_ICONS[service.category] || BriefcaseBusiness;

            CategoryIcon && (
              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            );

            return (
              <div key={service.id} className="p-4 hover:bg-muted/50">
                <div className="flex gap-4">
                  <div className="w-16 h-16 flex-shrink-0 border hover:border-primary  rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                    {CategoryIcon && (
                      <CategoryIcon className="h-8 w-8 text-primary" />
                    )}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{service.title}</h3>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description || "No description provided"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Coins className="h-3 w-3" />
                            {service.isHourly
                              ? `$${service.rate}/hr`
                              : `$${service.rate} fixed`}
                          </div>
                          {service.workerServiceAssignments &&
                            service.workerServiceAssignments.length > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="h-3 w-3" />
                                {service.workerServiceAssignments.length}{" "}
                                {service.workerServiceAssignments.length === 1
                                  ? "worker"
                                  : "workers"}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="text-right">
                        <Button
                          variant="default"
                          className="w-full md:w-auto"
                          onClick={() =>
                            showToast("info", "Coming Soon", "Service booking is not yet available")
                          }
                        >
                          Book Now
                        </Button>
                        <div className="flex items-center justify-end mt-2">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span className="text-sm">{service.averageRating?.toFixed(1) || "New"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
