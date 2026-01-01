/**
 * Supabase client for client-side usage
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types';

export const createClient = () => createClientComponentClient<Database>();

