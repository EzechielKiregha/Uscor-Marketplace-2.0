// app/business/freelance-services/_components/WorkerAssignment.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  ASSIGN_WORKER_TO_SERVICE
} from '@/graphql/freelance.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  BriefcaseBusiness,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_WORKERS } from '@/graphql/worker.gql';
import { useMe } from '@/lib/useMe';
import { WorkerEntity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkerAssignmentProps {
  serviceId: string;
  loading: boolean;
  storeId?: string | null;
}

export default function WorkerAssignment({
  serviceId,
  loading,
  storeId
}: WorkerAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [role, setRole] = useState('PRIMARY');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { showToast } = useToast();
  const user = useMe()

  const {
    data: workersData,
    loading: workersLoading,
    refetch
  } = useQuery(GET_WORKERS, {
    variables: { storeId },
    skip: !storeId
  });

  const [assignWorker] = useMutation(ASSIGN_WORKER_TO_SERVICE, {
    onCompleted: () => {
      refetch();
      showToast('success', 'Success', 'Worker assigned successfully');
      setShowAssignModal(false);
      setSelectedWorker(null);
      setRole('PRIMARY');
    },
    onError: (error) => {
      showToast('error', 'Error', 'Failed to assign worker');
    }
  });

  const filteredWorkers = useMemo(() => {
    if (!workersData?.workers) return [];

    return workersData.workers.filter((worker: WorkerEntity) =>
      (worker.fullName ? worker.fullName : "Unknown Worker").toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workersData, searchQuery]);

  const assignedWorkers = useMemo(() => {
    if (!workersData?.workers) return [];
    return workersData.workers.filter((worker: WorkerEntity) =>
      // guard against undefined assignments by falling back to an empty array
      (worker.workerServiceAssignments ?? []).some(assignment =>
        assignment.freelanceServiceId === serviceId
      )
    );
  }, [workersData, serviceId]);

  const handleAssignWorker = () => {
    if (!selectedWorker) return;

    assignWorker({
      variables: {
        input: {
          serviceId,
          workerIds: [selectedWorker.id],
          role
        }
      }
    });
  };

  if (loading || workersLoading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg">Worker Assignments</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Assign workers to manage your freelance services
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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

            <Button
              variant="default"
              onClick={() => setShowAssignModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Worker
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {assignedWorkers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            No workers assigned to this service yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Worker</th>
                  <th className="py-3 font-medium">Role</th>
                  <th className="py-3 font-medium">Assigned Date</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedWorkers.map((worker: WorkerEntity) => {
                  // safe-find: guard with fallback array and accept either field name
                  const assignment = (worker.workerServiceAssignments ?? []).find(
                    (a: any) => (a.freelanceServiceId ?? a.serviceId) === serviceId
                  );
                  return (
                    <tr key={worker.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                            {worker.fullName ? worker.fullName.charAt(0) : "W"}
                          </div>
                          <div>
                            <p className="font-medium">{worker.fullName}</p>
                            <p className="text-sm text-muted-foreground">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 capitalize">{assignment?.role ? assignment.role.toLowerCase() : "unknown"}</td>
                      <td className="py-3">
                        {new Date(assignment ? assignment.assignedAt : new Date()).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setRole(assignment?.role ? assignment.role.toLowerCase() : "unknown");
                            setShowAssignModal(true);
                          }}
                        >
                          Edit Assignment
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Assign Worker Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedWorker ? 'Edit Assignment' : 'Assign Worker'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedWorker
                      ? `Assign ${selectedWorker.fullName} to this service`
                      : 'Select a worker to assign to this service'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedWorker(null);
                    setRole('PRIMARY');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!selectedWorker ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search workers by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {filteredWorkers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No matching workers found' : 'No workers available'}
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {filteredWorkers.map((worker: WorkerEntity) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg hover:bg-muted/50 cursor-pointer mb-2"
                          onClick={() => setSelectedWorker(worker)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                              {worker.fullName ? worker.fullName.charAt(0) : "W"}
                            </div>
                            <div>
                              <p className="font-medium">{worker.fullName}</p>
                              <p className="text-sm text-muted-foreground">{worker.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {selectedWorker.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{selectedWorker.fullName}</p>
                      <p className="text-sm text-muted-foreground">{selectedWorker.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                    >
                      <option value="PRIMARY">Primary Worker</option>
                      <option value="ASSISTANT">Assistant</option>
                      <option value="SUPERVISOR">Supervisor</option>
                    </select>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Define the worker's role in this service
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4" />
                      Service Assignment
                    </h3>
                    <p className="text-sm">
                      {selectedWorker.fullName} will be assigned as a {role.toLowerCase()} {' '}
                      for this service. They will be able to manage service orders and
                      interact with customers.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedWorker(null);
                        setRole('PRIMARY');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-accent text-primary-foreground"
                      onClick={handleAssignWorker}
                    >
                      {selectedWorker ? 'Update Assignment' : 'Assign Worker'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}