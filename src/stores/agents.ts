import { defineStore } from 'pinia'
import { CapacitorHttp } from '@capacitor/core'
import { useAuthStore } from './auth'

export interface Agent {
  id: number | string
  hostname: string
  client_name: string
  site_name: string
  monitoring_type: string
  status: string
  last_seen: string
  operating_system: string
  public_ip: string
  local_ips: string
  agent_id: string
  version: string
  boot_time: number
  checks?: {
    total: number
    passing: number
    failing: number
    warning: number
    info: number
  }
}

export interface SiteGroup {
  name: string
  agents: Agent[]
}

export interface ClientGroup {
  name: string
  sites: SiteGroup[]
}

export interface AgentService {
  name: string
  display_name: string
  status: string
  start_type: string
}

export interface AgentSoftware {
  name: string
  version: string
  install_date: string
}

export interface AgentProcess {
  pid: number
  name: string
  cpu_percent: number
  memory_percent: number
}

export interface AgentScript {
  id: number
  name: string
  description: string
  category: string
}

export const useAgentStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    services: [] as AgentService[],
    software: [] as AgentSoftware[],
    processes: [] as AgentProcess[],
    scripts: [] as AgentScript[],
    loading: false,
    managementLoading: false,
    error: null as string | null,
    discoveredBasePath: localStorage.getItem('discoveredBasePath') || '/api/v3/agents/' as string,
  }),
  getters: {
    getGroups: (state): ClientGroup[] => {
      const clients: Record<string, ClientGroup> = {}
      
      state.agents.forEach(agent => {
        if (!clients[agent.client_name]) {
          clients[agent.client_name] = { name: agent.client_name, sites: [] }
        }
        
        const client = clients[agent.client_name]
        if (client) {
          let site = client.sites.find(s => s.name === agent.site_name)
          
          if (!site) {
            site = { name: agent.site_name, agents: [] }
            client.sites.push(site)
          }
          
          site.agents.push(agent)
        }
      })
      
      return Object.values(clients).sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  actions: {
    async fetchAgents() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated || this.loading) return
      
      this.loading = true
      this.error = null
      
      const endpoints = [
        this.discoveredBasePath,
        '/agents/',
        '/api/v3/agents/',
      ]

      const uniqueEndpoints = [...new Set(endpoints)]
      let lastError = null
      
      for (const path of uniqueEndpoints) {
        try {
          const response = await CapacitorHttp.get({
            url: `${auth.apiUrl}${path}`,
            headers: {
              'X-API-KEY': auth.apiKey,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.status === 200) {
            let rawAgents = []
            if (Array.isArray(response.data)) {
              rawAgents = response.data
            } else if (response.data && Array.isArray(response.data.results)) {
              rawAgents = response.data.results
            } else if (response.data && Array.isArray(response.data.agents)) {
              rawAgents = response.data.agents
            }
            
            this.agents = rawAgents.map((a: any) => ({
              ...a,
              id: a.agent_id || a.id || a.pk,
              local_ips: a.local_ips || a.local_ip || ''
            }))
            
            this.error = null
            this.loading = false
            this.discoveredBasePath = path
            localStorage.setItem('discoveredBasePath', path)
            return
          }
        } catch (err: any) {
          lastError = err.message || 'Network error'
        }
      }

      this.error = lastError
      this.loading = false
    },

    async fetchAgentDetails(agentId: string | number, type: 'services' | 'software' | 'processes') {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return

      this.managementLoading = true
      
      const typeMap: Record<string, string[]> = {
        services: ['winservices', 'services', 'getservices'],
        software: ['software', 'inventory', 'getsoftware'],
        processes: ['processes']
      }

      const subtypes = typeMap[type] || [type]
      const basePaths = [this.discoveredBasePath, '/api/v3/agents/', '/agents/']
      
      const paths: string[] = []
      basePaths.forEach(base => {
        subtypes.forEach(sub => {
          paths.push(`${base}${agentId}/${sub}/`)
        })
      })

      for (const path of [...new Set(paths)]) {
        try {
          const response = await CapacitorHttp.get({
            url: `${auth.apiUrl}${path}`,
            headers: { 'X-API-KEY': auth.apiKey }
          })

          if (response.status === 200) {
            if (type === 'services') this.services = response.data
            else if (type === 'software') this.software = response.data
            else if (type === 'processes') this.processes = response.data
            this.managementLoading = false
            return
          }
        } catch (e) {}
      }
      this.managementLoading = false
    },

    async fetchScripts() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return

      this.managementLoading = true
      const endpoints = [
        '/scripts/',
        '/api/v3/scripts/',
        '/api/v1/scripts/',
      ]

      for (const path of endpoints) {
        try {
          const response = await CapacitorHttp.get({
            url: `${auth.apiUrl}${path}`,
            headers: { 'X-API-KEY': auth.apiKey }
          })

          if (response.status === 200) {
            this.scripts = response.data
            this.managementLoading = false
            return
          }
        } catch (e) {}
      }
      this.managementLoading = false
    },

    async runAgentCommand(agentId: string | number, action: string, data: any = {}) {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return false

      const basePaths = [this.discoveredBasePath, '/api/v3/agents/', '/agents/']
      const paths: string[] = []
      basePaths.forEach(base => {
        paths.push(`${base}${agentId}/${action}/`)
      })

      for (const path of [...new Set(paths)]) {
        try {
          const response = await CapacitorHttp.post({
            url: `${auth.apiUrl}${path}`,
            data,
            headers: { 
              'X-API-KEY': auth.apiKey,
              'Content-Type': 'application/json'
            }
          })
          if (response.status === 200 || response.status === 202) return true
        } catch (e) {}
      }
      return false
    },

    async getMeshUrl(agentId: number | string, mode: 'control' | 'terminal' | 'file') {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return null

      const modeMap = { 'control': '11', 'terminal': '12', 'file': '13' }
      const viewmode = modeMap[mode] || '11'

      const basePaths = [this.discoveredBasePath, '/api/v3/agents/', '/agents/']
      const tokenEndpoints = ['mesh', 'token', 'meshcentral']
      
      const paths: string[] = []
      basePaths.forEach(base => {
        tokenEndpoints.forEach(end => {
          paths.push(`${base}${agentId}/${end}/`)
        })
      })

      for (const path of [...new Set(paths)]) {
        try {
          const response = await CapacitorHttp.get({
            url: `${auth.apiUrl}${path}`,
            params: { mode },
            headers: { 'X-API-KEY': auth.apiKey }
          })
          
          if (response.status === 200) {
            let finalUrl = ''
            const rawUrl = response.data?.[mode] || response.data?.url
            
            if (rawUrl) {
              finalUrl = rawUrl.replace(/viewmode=\d+/, `viewmode=${viewmode}`)
              if (!finalUrl.includes('viewmode=')) finalUrl += `${finalUrl.includes('?') ? '&' : '?'}viewmode=${viewmode}`
            } else if (response.data?.token) {
              const { token, nodeid } = response.data
              
              let meshHost = ''
              try {
                const apiHost = new URL(auth.apiUrl).hostname
                if (apiHost.startsWith('api.')) {
                  meshHost = apiHost.replace(/^api\./, 'mesh.')
                } else {
                  // Fallback to base domain logic
                  const domain = apiHost.split('.').slice(-2).join('.')
                  meshHost = `mesh.${domain}`
                }
              } catch (e) {
                meshHost = 'mesh.gaulabs.com'
              }
              
              finalUrl = `https://${meshHost}/?login=${token}&gotonode=${nodeid || agentId}&viewmode=${viewmode}`
            }

            if (finalUrl) {
              const urlObj = new URL(finalUrl)
              const params = new URLSearchParams(urlObj.search)
              params.set('mobile', '1')
              params.set('touch', '1')
              params.set('embedded', '1')
              params.set('hide', '31')
              params.set('starget', '1')
              urlObj.search = params.toString()
              
              try { await CapacitorHttp.get({ url: urlObj.toString(), disableRedirects: true }) } catch (e) {}
              return urlObj.toString()
            }
          }
        } catch (err: any) {}
      }
      return null
    },
  },
})
