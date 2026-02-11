import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/Header';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadsPagination } from '@/components/leads/LeadsPagination';
import { LeadDialog } from '@/components/leads/LeadDialog';
import { DeleteLeadDialog } from '@/components/leads/DeleteLeadDialog';
import { useLeads } from '@/hooks/useLeads';
import { Lead, LeadStatus, LeadFilters as LeadFiltersType, SortField, SortOrder, DEFAULT_PAGE_SIZE } from '@/types/lead';
import { Plus, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Memoize filters to prevent unnecessary refetches
  const filters: LeadFiltersType = useMemo(() => ({
    status: statusFilter,
    search,
    dateFrom,
    dateTo,
    sortField,
    sortOrder,
    page,
    pageSize,
  }), [statusFilter, search, dateFrom, dateTo, sortField, sortOrder, page, pageSize]);

  const { leads, loading, totalCount, totalPages, createLead, updateLead, deleteLead } = useLeads(
    session?.user?.id,
    filters
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCreateSubmit = async (values: { name: string; email: string; status: LeadStatus; company?: string; phone?: string; notes?: string }) => {
    setIsSubmitting(true);
    const result = await createLead(values);
    setIsSubmitting(false);
    if (result) {
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (values: { name: string; email: string; status: LeadStatus; company?: string; phone?: string; notes?: string }) => {
    if (!editingLead) return;
    setIsSubmitting(true);
    const result = await updateLead(editingLead.id, values);
    setIsSubmitting(false);
    if (result) {
      setEditingLead(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLead) return;
    setIsSubmitting(true);
    const success = await deleteLead(deletingLead.id);
    setIsSubmitting(false);
    if (success) {
      setDeletingLead(null);
    }
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Calculate stats from total (not just current page)
  const wonLeads = leads.filter(l => l.status === 'Closed-Won').length;
  const lostLeads = leads.filter(l => l.status === 'Closed-Lost').length;
  const activeLeads = leads.filter(l => !['Closed-Won', 'Closed-Lost'].includes(l.status)).length;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header email={session.user.email} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wonLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lost</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lostLeads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Leads</CardTitle>
                <CardDescription>Manage your sales leads pipeline</CardDescription>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <LeadFilters
              statusFilter={statusFilter}
              onStatusChange={(status) => { setStatusFilter(status); setPage(1); }}
              search={search}
              onSearchChange={(s) => { setSearch(s); setPage(1); }}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={(d) => { setDateFrom(d); setPage(1); }}
              onDateToChange={(d) => { setDateTo(d); setPage(1); }}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
            />

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <LeadsTable
                  leads={leads}
                  onEdit={setEditingLead}
                  onDelete={setDeletingLead}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleColumnSort}
                />
                <LeadsPagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Lead Dialog */}
      <LeadDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Edit Lead Dialog */}
      <LeadDialog
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
        lead={editingLead || undefined}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Lead Dialog */}
      <DeleteLeadDialog
        open={!!deletingLead}
        onOpenChange={(open) => !open && setDeletingLead(null)}
        lead={deletingLead}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default Dashboard;