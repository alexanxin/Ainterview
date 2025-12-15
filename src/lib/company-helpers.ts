// Helper function to check if the current user has a company account
import { getCompanyByUserId } from '@/lib/database';

export async function userHasCompany(userId: string): Promise<boolean> {
  try {
    const company = await getCompanyByUserId(userId);
    return !!company;
  } catch (error) {
    console.error('Error checking company status:', error);
    return false;
  }
}