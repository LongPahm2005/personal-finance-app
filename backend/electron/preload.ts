import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Database / System
  system: {
    testDb: () => ipcRenderer.invoke('system:testDb'),
    backupDb: (targetPath?: string) => ipcRenderer.invoke('system:backupDb', targetPath),
    restoreDb: (filePath?: string) => ipcRenderer.invoke('system:restoreDb', filePath),
    exportData: () => ipcRenderer.invoke('system:exportData'),
  },

  // Categories
  categories: {
    list: (type?: 'income' | 'expense') => ipcRenderer.invoke('categories:list', type),
    create: (data: unknown) => ipcRenderer.invoke('categories:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('categories:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('categories:delete', id),
  },

  // Wallets
  wallets: {
    list: () => ipcRenderer.invoke('wallets:list'),
    getById: (id: number) => ipcRenderer.invoke('wallets:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('wallets:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('wallets:update', id, data),
    deactivate: (id: number) => ipcRenderer.invoke('wallets:deactivate', id),
    activate: (id: number) => ipcRenderer.invoke('wallets:activate', id),
    delete: (id: number) => ipcRenderer.invoke('wallets:delete', id),
    getTotalBalance: () => ipcRenderer.invoke('wallets:getTotalBalance'),
    adjustBalance: (walletId: number, newBalance: number, note?: string) =>
      ipcRenderer.invoke('wallets:adjustBalance', walletId, newBalance, note),
  },

  // Transactions
  transactions: {
    list: (filters: unknown) => ipcRenderer.invoke('transactions:list', filters),
    getById: (id: number) => ipcRenderer.invoke('transactions:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('transactions:create', data),
    createTransfer: (data: unknown) => ipcRenderer.invoke('transactions:createTransfer', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('transactions:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('transactions:delete', id),
    getRecent: (limit?: number) => ipcRenderer.invoke('transactions:getRecent', limit),
    getMonthly: (year: number, month: number) => ipcRenderer.invoke('transactions:getMonthly', year, month),
  },

  // Debts
  debts: {
    list: (filters?: unknown) => ipcRenderer.invoke('debts:list', filters),
    getById: (id: number) => ipcRenderer.invoke('debts:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('debts:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('debts:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('debts:delete', id),
    pay: (debtId: number, data: unknown) => ipcRenderer.invoke('debts:pay', debtId, data),
    getPayments: (debtId: number) => ipcRenderer.invoke('debts:getPayments', debtId),
    getSummary: () => ipcRenderer.invoke('debts:getSummary'),
  },

  // Budgets
  budgets: {
    list: () => ipcRenderer.invoke('budgets:list'),
    getById: (id: number) => ipcRenderer.invoke('budgets:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('budgets:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('budgets:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('budgets:delete', id),
    getUsage: (id: number) => ipcRenderer.invoke('budgets:getUsage', id),
    getActive: () => ipcRenderer.invoke('budgets:getActive'),
  },

  // Savings
  savings: {
    list: () => ipcRenderer.invoke('savings:list'),
    getById: (id: number) => ipcRenderer.invoke('savings:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('savings:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('savings:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('savings:delete', id),
    addAmount: (id: number, amount: number) => ipcRenderer.invoke('savings:addAmount', id, amount),
  },

  // Recurring
  recurring: {
    list: () => ipcRenderer.invoke('recurring:list'),
    create: (data: unknown) => ipcRenderer.invoke('recurring:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('recurring:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('recurring:delete', id),
    processDue: () => ipcRenderer.invoke('recurring:processDue'),
  },

  // Reports
  reports: {
    getDashboardSummary: () => ipcRenderer.invoke('reports:getDashboardSummary'),
    getMonthlyCashFlow: (year?: number) => ipcRenderer.invoke('reports:getMonthlyCashFlow', year),
    getCategoryExpenses: (month?: string) => ipcRenderer.invoke('reports:getCategoryExpenses', month),
    getBalanceTrend: (months?: number) => ipcRenderer.invoke('reports:getBalanceTrend', months),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronAPI = typeof api;
