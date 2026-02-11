import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus, CreateLeadInput, UpdateLeadInput, LeadFilters, DEFAULT_PAGE_SIZE } from '@/types/lead';
import { useMessageDialog } from '@/components/ui/message-dialog';

export function useLeads(userId: string | undefined, filters: LeadFilters = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showMessage } = useMessageDialog();

  const fetchLeads = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const {
        status = 'all',
        search = '',
        dateFrom,
        dateTo,
        sortField = 'created_at',
        sortOrder = 'desc',
        page = 1,
        pageSize = DEFAULT_PAGE_SIZE,
      } = filters;

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      setLeads((data as Lead[]) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message);
      showMessage({
        title: 'Error fetching leads',
        description: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, filters, showMessage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (input: CreateLeadInput): Promise<Lead | null> => {
    if (!userId) return null;
    
    try {
      const { data, error: createError } = await supabase
        .from('leads')
        .insert({
          user_id: userId,
          name: input.name,
          email: input.email,
          status: input.status || 'New',
          company: input.company || null,
          phone: input.phone || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newLead = data as Lead;
      await fetchLeads();
      
      showMessage({
        title: 'Lead created',
        description: `Successfully created lead for ${input.name}`,
        type: 'success',
      });
      
      return newLead;
    } catch (err: any) {
      showMessage({
        title: 'Error creating lead',
        description: err.message,
        type: 'error',
      });
      return null;
    }
  };

  const updateLead = async (id: string, input: UpdateLeadInput): Promise<Lead | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('leads')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedLead = data as Lead;
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      
      showMessage({
        title: 'Lead updated',
        description: 'Successfully updated lead',
        type: 'success',
      });
      
      return updatedLead;
    } catch (err: any) {
      showMessage({
        title: 'Error updating lead',
        description: err.message,
        type: 'error',
      });
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchLeads();
      
      showMessage({
        title: 'Lead deleted',
        description: 'Successfully deleted lead',
        type: 'success',
      });
      
      return true;
    } catch (err: any) {
      showMessage({
        title: 'Error deleting lead',
        description: err.message,
        type: 'error',
      });
      return false;
    }
  };

  const totalPages = Math.ceil(totalCount / (filters.pageSize || DEFAULT_PAGE_SIZE));

  return {
    leads,
    loading,
    error,
    totalCount,
    totalPages,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}