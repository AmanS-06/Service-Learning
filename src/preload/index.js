import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  beneficiaries: {
    list:    ()         => ipcRenderer.invoke('beneficiary:list'),
    get:     (id)       => ipcRenderer.invoke('beneficiary:get', id),
    create:  (data)     => ipcRenderer.invoke('beneficiary:create', data),
    update:  (id, data) => ipcRenderer.invoke('beneficiary:update', id, data),
    delete:  (id)       => ipcRenderer.invoke('beneficiary:delete', id),
    search:  (q)        => ipcRenderer.invoke('beneficiary:search', q),
    export:  ()         => ipcRenderer.invoke('beneficiary:export'),
  },
  production: {
    list:    ()         => ipcRenderer.invoke('production:list'),
    get:     (id)       => ipcRenderer.invoke('production:get', id),
    create:  (data)     => ipcRenderer.invoke('production:create', data),
    update:  (id, data) => ipcRenderer.invoke('production:update', id, data),
    delete:  (id)       => ipcRenderer.invoke('production:delete', id),
    search:  (q)        => ipcRenderer.invoke('production:search', q),
    export:  ()         => ipcRenderer.invoke('production:export'),
  },
  stallSales: {
    list:    ()         => ipcRenderer.invoke('stallSales:list'),
    get:     (id)       => ipcRenderer.invoke('stallSales:get', id),
    create:  (data)     => ipcRenderer.invoke('stallSales:create', data),
    update:  (id, data) => ipcRenderer.invoke('stallSales:update', id, data),
    delete:  (id)       => ipcRenderer.invoke('stallSales:delete', id),
    search:  (q)        => ipcRenderer.invoke('stallSales:search', q),
    export:  ()         => ipcRenderer.invoke('stallSales:export'),
  },
  dashboard: {
    summary: () => ipcRenderer.invoke('dashboard:summary'),
  }
})