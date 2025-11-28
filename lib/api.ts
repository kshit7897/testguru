import { Party, Item, Invoice, Payment, User } from '../types';

// Generic Fetcher
async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    // Try to parse JSON error if available
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || `API Error: ${res.status}`);
    } catch (e) {
      throw new Error(`API Error: ${res.status} ${errorText}`);
    }
  }
  return res.json();
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      return fetcher('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    }
  },
  dashboard: {
    getStats: async () => fetcher('/api/dashboard'),
    getRecentTransactions: async () => {
      const data = await fetcher('/api/dashboard');
      return data.recentTransactions;
    }
  },
  parties: {
    list: async () => fetcher('/api/parties'),
    get: async (id: string) => fetcher(`/api/parties?id=${id}`),
    add: async (party: Party) => fetcher('/api/parties', {
      method: 'POST',
      body: JSON.stringify(party),
    }),
    update: async (party: Party) => fetcher('/api/parties', {
      method: 'PUT',
      body: JSON.stringify(party),
    }),
    delete: async (id: string) => fetcher(`/api/parties?id=${id}`, { method: 'DELETE' })
  },
  items: {
    list: async () => fetcher('/api/items'),
    add: async (item: Item) => fetcher('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    update: async (item: Item) => fetcher('/api/items', {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
    delete: async (id: string) => fetcher(`/api/items?id=${id}`, { method: 'DELETE' })
  },
  payments: {
    add: async (payment: any) => fetcher('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),
    list: async (partyId?: string) => fetcher(`/api/payments${partyId ? `?partyId=${partyId}` : ''}`)
  },
  invoices: {
    add: async (invoice: any) => fetcher('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    }),
    get: async (id: string) => fetcher(`/api/invoices/${id}`)
  },
  reports: {
    getOutstanding: async () => fetcher('/api/reports/outstanding'),
    getLedger: async (partyId: string, startDate?: string, endDate?: string) => {
      const params = new URLSearchParams({ partyId });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return fetcher(`/api/reports/ledger?${params.toString()}`);
    },
    getStock: async () => fetcher('/api/reports/stock')
  },
  users: {
    list: async () => fetcher('/api/users'),
    add: async (user: any) => fetcher('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
    delete: async (id: string) => fetcher(`/api/users?id=${id}`, { method: 'DELETE' })
  }
};