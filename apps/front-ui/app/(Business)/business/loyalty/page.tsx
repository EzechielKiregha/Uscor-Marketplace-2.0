"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Star,
  Users,
  TrendingUp,
  Gift,
  BarChart,
  Settings,
  Plus,
  Filter,
} from "lucide-react";
import LoyaltyProgramOverview from "./_components/LoyaltyProgramOverview";
import ProgramConfiguration from "./_components/ProgramConfiguration";
import CustomerPointsManagement from "./_components/CustomerPointsManagement";
import RedemptionProcess from "./_components/RedemptionProcess";
import CreateLoyaltyProgramModal from "./_components/CreateLoyaltyProgramModal";
import { useLoyalty } from "./_hooks/use-loyalty";
import { useMe } from "@/lib/useMe";
import PageSkeleton from "@/components/skeletons/PageSkeleton";

export default function LoyaltyProgramPage() {
  const { user, role, loading: authLoading } = useMe();
  const [activeTab, setActiveTab] = useState<
    "overview" | "configuration" | "customers" | "redemption"
  >("overview");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { getPrograms, programsLoading } = useLoyalty(user?.id || "");

  const programs = getPrograms();

  const selectedProgram =
    programs.find((p: any) => p.id === selectedProgramId) || programs[0];

  useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  if (authLoading || programsLoading) return <PageSkeleton />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Business Access Required</h1>
          <p className="text-muted-foreground mt-2">
            You need to be logged in as a business owner to access loyalty
            programs
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => {
              const currentPath = encodeURIComponent(window.location.pathname);
              window.location.href = `/login?redirect=${currentPath}`;
            }}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const handleProgramCreated = (newProgram: any) => {
    // refetch();
    setSelectedProgramId(newProgram.id);
    setActiveTab("overview");
    setShowCreateModal(false);
  };

  const handleProgramUpdated = (updatedProgram: any) => {
    setSelectedProgramId(updatedProgram.id);
    setActiveTab("overview");
  };

  const handleProgramDeleted = (deletedProgramId: string) => {
    // refetch();
    if (selectedProgramId === deletedProgramId) {
      setSelectedProgramId(programs[0]?.id || null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loyalty Program</h1>
        <p className="text-muted-foreground">
          Reward customers and build lasting relationships
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-1">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "configuration" ? "default" : "outline"}
            onClick={() => setActiveTab("configuration")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configuration
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "outline"}
            onClick={() => setActiveTab("customers")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Customers
          </Button>
          <Button
            variant={activeTab === "redemption" ? "default" : "outline"}
            onClick={() => setActiveTab("redemption")}
            className="flex items-center gap-2"
          >
            <Gift className="h-4 w-4" />
            Redemption
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedProgramId || ""}
            onChange={(e) => setSelectedProgramId(e.target.value || null)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {programs.map((program: any) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>

          <Button variant="default" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {programs.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              No Loyalty Programs Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first loyalty program to reward customers and build
              lasting relationships. Perfect for artisans, wood workers, and
              small retailers to encourage repeat customers.
            </p>

            <Button
              variant="default"
              className="h-11 px-6"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Program
            </Button>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <LoyaltyProgramOverview
                programId={selectedProgramId || programs[0].id}
                onEditProgram={() => setActiveTab("configuration")}
                onDeleteProgram={handleProgramDeleted}
              />
            )}

            {activeTab === "configuration" && selectedProgram && (
              <ProgramConfiguration
                program={selectedProgram}
                loading={programsLoading}
                onProgramUpdated={handleProgramUpdated}
              />
            )}

            {activeTab === "customers" && selectedProgramId && (
              <CustomerPointsManagement
                programId={selectedProgramId}
                loading={programsLoading}
                // businessId={user.business.id}
              />
            )}

            {activeTab === "redemption" && selectedProgramId && (
              <RedemptionProcess
                programId={selectedProgramId}
                loading={programsLoading}
                // businessId={user.business.id}
              />
            )}
          </>
        )}
      </div>

      {/* Create Loyalty Program Modal */}
      {showCreateModal && (
        <CreateLoyaltyProgramModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProgramCreated={handleProgramCreated}
        />
      )}
    </div>
  );
}
