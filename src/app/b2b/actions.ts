'use server';

import { getCompanyDashboardStats, createJobPostDB, createCompanyDB } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Server action to fetch company dashboard stats.
 * This MUST be run on the server because it uses the admin Supabase client
 * (via getJobViewsCountByCompanyId -> usage_tracking query) which requires
 * the SUPABASE_SERVICE_ROLE_KEY to bypass RLS for anonymous view logs.
 */
export async function fetchCompanyDashboardStats(companyId: string) {
  try {
    const stats = await getCompanyDashboardStats(companyId);
    return stats;
  } catch (error) {
    console.error('Error in fetchCompanyDashboardStats action:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}

export async function createJobPost(companyId: string, jobData: any) {
  try {
    const newJob = await createJobPostDB(companyId, jobData);
    revalidatePath('/jobs');
    revalidatePath('/b2b/dashboard');
    return newJob;
  } catch (error) {
    console.error('Error in createJobPost action:', error);
    // Re-throw the error so the client can handle it, or throw a more specific error
    throw error instanceof Error ? error : new Error('Failed to create job post: ' + JSON.stringify(error));
  }
}

export async function createCompany(userId: string, companyData: any) {
  // Note: We are trusting the client to provide the correct user ID here because
  // we are currently missing the @supabase/auth-helpers-nextjs package or @supabase/ssr
  // to properly validate the session cookie on the server.
  // In a production environment, this should be replaced with proper server-side session validation.
  
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const newCompany = await createCompanyDB(userId, companyData);
    revalidatePath('/b2b/dashboard');
    return { success: true, data: newCompany };
  } catch (error) {
    console.error('Error in createCompany action:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create company profile' };
  }
}
