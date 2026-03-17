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
  local_ip: string
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
    discoveredBasePath: localStorage.getItem('discoveredBasePath') || '/agents/' as string,
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
          const options = {
            url: `${auth.apiUrl}${path}`,
            headers: {
              'X-API-KEY': auth.apiKey,
              'Content-Type': 'application/json'
            }
          }
          
          const response = await CapacitorHttp.get(options)
          
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
              id: a.id || a.agent_id
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
      this.agents = []
      this.loading = false
    },

    async fetchAgentDetails(agentId: string | number, type: 'services' | 'software' | 'processes') {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return

      this.managementLoading = true
      try {
        const response = await CapacitorHttp.get({
          url: `${auth.apiUrl}${this.discoveredBasePath}${agentId}/${type}/`,
          headers: { 'X-API-KEY': auth.apiKey }
        })

        if (response.status === 200) {
          if (type === 'services') this.services = response.data
          else if (type === 'software') this.software = response.data
          else if (type === 'processes') this.processes = response.data
        }
      } catch (e) {
        console.error(`Failed to fetch ${type}`, e)
      } finally {
        this.managementLoading = false
      }
    },

    async fetchScripts() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return

      this.managementLoading = true
      const endpoints = [
        '/api/v3/scripts/',
        '/scripts/',
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

      try {
        const response = await CapacitorHttp.post({
          url: `${auth.apiUrl}${this.discoveredBasePath}${agentId}/${action}/`,
          data,
          headers: { 
            'X-API-KEY': auth.apiKey,
            'Content-Type': 'application/json'
          }
        })
        return response.status === 200 || response.status === 202
      } catch (e) {
        console.error(`Command ${action} failed`, e)
        return false
      }
    },

    async getMeshUrl(agentId: number | string, mode: 'control' | 'terminal' | 'file') {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return null

      const modeMap = {
        'control': '11',
        'terminal': '12',
        'file': '13'
      }
      const viewmode = modeMap[mode] || '11'

      const endpoints = [
        `/api/v3/agents/${agentId}/token/`,
        `${this.discoveredBasePath}${agentId}/token/`,
      ]

      for (const path of endpoints) {
        try {
          const options = {
            url: path.startsWith('http') ? path : `${auth.apiUrl}${path}`,
            params: { mode },
            headers: {
              'X-API-KEY': auth.apiKey,
              'Content-Type': 'application/json'
            }
          }
          
          const response = await CapacitorHttp.get(options)
          
          if (response.status === 200) {
            let finalUrl = ''
            const rawUrl = response.data?.[mode] || response.data?.url
            if (rawUrl) {
              let refined = rawUrl
              if (refined.includes('viewmode=')) {
                refined = refined.replace(/viewmode=\d+/, `viewmode=${viewmode}`)
              } else {
                refined += `&viewmode=${viewmode}`
              }
              refined += refined.includes('?') ? '&' : '?'
              refined += 'mobile=1&touch=1&embedded=1&hide=31&starget=1'
              finalUrl = refined
            }
            
            if (!finalUrl && response.data?.token) {
              const token = response.data.token
              const nodeid = response.data.nodeid || agentId
              finalUrl = `https://mesh.gaulabs.com/?login=${token}&gotonode=${nodeid}&viewmode=${viewmode}&hide=31&embedded=1&starget=1&mobile=1&touch=1`
            }

            if (finalUrl) {
              try {
                await CapacitorHttp.get({ url: finalUrl, disableRedirects: true })
              } catch (e) {}
              return finalUrl
            }
          }
        } catch (err: any) {}
      }
      return null
    },
  },
})
