import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'recovery_agent_supabase_url';
const STORAGE_ANON_KEY = 'recovery_agent_supabase_anon_key';

export function normalizeSupabaseUrl(input: string): string {
  let url = (input || '').trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
}

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // Check localStorage first (user-configured in UI)
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) : null;

  if (storedUrl && storedKey) {
    return {
      url: normalizeSupabaseUrl(storedUrl),
      anonKey: storedKey.trim(),
      isConfigured: true,
    };
  }

  // Fallback to Vite environment variables
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return {
      url: normalizeSupabaseUrl(envUrl),
      anonKey: envKey,
      isConfigured: true,
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
    // Clear cache
    cachedClient = null;
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    cachedClient = null;
  }
}

let cachedClient: { client: SupabaseClient; key: string } | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  const cacheSignature = `${url}___${anonKey}`;
  if (cachedClient && cachedClient.key === cacheSignature) {
    return cachedClient.client;
  }

  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedClient = { client, key: cacheSignature };
    return client;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface TestResult {
  success: boolean;
  message: string;
  tableDetails?: {
    auditLogsTable?: string;
    auditLogsCount?: number;
    failedPaymentsTable?: string;
    failedPaymentsCount?: number;
    actionLogsTable?: string;
    actionLogsCount?: number;
  };
  details?: string;
  helpHint?: string;
}

export async function testConnection(
  testUrl?: string,
  testKey?: string
): Promise<TestResult> {
  try {
    const rawUrl = testUrl !== undefined ? testUrl : getSupabaseCredentials().url;
    const rawKey = testKey !== undefined ? testKey : getSupabaseCredentials().anonKey;
    const url = normalizeSupabaseUrl(rawUrl);
    const anonKey = (rawKey || '').trim();

    if (!url || !anonKey) {
      return { 
        success: false, 
        message: 'Both Supabase Project URL and Anon Key are required.' 
      };
    }

    const testClient = createClient(url, anonKey, { auth: { persistSession: false } });

    // 1. Test audit_logs (Priority table)
    let auditTable = '';
    let auditCount = 0;
    const auditRes = await testClient.from('audit_logs').select('*', { count: 'exact', head: true });
    
    if (!auditRes.error) {
      auditTable = 'audit_logs';
      auditCount = auditRes.count || 0;
    } else {
      // Check action_log or action_logs
      const alRes = await testClient.from('action_log').select('*', { count: 'exact', head: true });
      if (!alRes.error) {
        auditTable = 'action_log';
        auditCount = alRes.count || 0;
      } else {
        const alRes2 = await testClient.from('action_logs').select('*', { count: 'exact', head: true });
        if (!alRes2.error) {
          auditTable = 'action_logs';
          auditCount = alRes2.count || 0;
        }
      }
    }

    // 2. Test failed_payments
    let fpTable = '';
    let fpCount = 0;
    const fpRes = await testClient.from('failed_payments').select('*', { count: 'exact', head: true });
    if (!fpRes.error) {
      fpTable = 'failed_payments';
      fpCount = fpRes.count || 0;
    } else {
      const fpRes2 = await testClient.from('failed_payment').select('*', { count: 'exact', head: true });
      if (!fpRes2.error) {
        fpTable = 'failed_payment';
        fpCount = fpRes2.count || 0;
      }
    }

    if (!auditTable && !fpTable) {
      const errorMsg = auditRes.error?.message || fpRes.error?.message || 'Tables not found';
      let hint = '';
      if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
        hint = "Table 'audit_logs' or 'failed_payments' does not exist in this database yet. Run the SQL table creation script in Supabase.";
      } else if (errorMsg.includes('policy') || errorMsg.includes('permission') || auditRes.error?.code === '42501') {
        hint = "Row Level Security (RLS) is blocking read access. Add a SELECT policy for anon on audit_logs.";
      } else if (errorMsg.includes('JWT') || errorMsg.includes('apikey')) {
        hint = "Invalid Anon Key or Project URL. Verify credentials from Supabase Settings -> API.";
      }

      return {
        success: false,
        message: `Database connection test failed: ${errorMsg}`,
        helpHint: hint,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to your Supabase database!',
      tableDetails: {
        auditLogsTable: auditTable || undefined,
        auditLogsCount: auditTable ? auditCount : undefined,
        failedPaymentsTable: fpTable || undefined,
        failedPaymentsCount: fpTable ? fpCount : undefined,
      },
    };
  } catch (error: any) {
    const msg = error?.message || 'Network or configuration error connecting to Supabase.';
    let hint = '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      hint = 'Network connection failed. Verify the URL is a valid Supabase project endpoint (e.g. https://xyz.supabase.co).';
    }
    return {
      success: false,
      message: msg,
      helpHint: hint,
    };
  }
}
