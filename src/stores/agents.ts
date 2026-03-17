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

export const useAgentStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    loading: false,
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
        this.discoveredBasePath, // Try cached one first
        '/agents/', // Known success for this user
        '/api/v3/agents/',
        '/api/v3/agents',
        '/api/v2/agents/',
        '/api/v1/agents/',
        '/api/agents/',
        '/api/beta/v1/agents/'
      ]

      // Filter duplicates
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
          
          console.log(`Trying endpoint: ${path}`)
          const response = await CapacitorHttp.get(options)
          
          if (response.status === 200) {
            console.log(`Success on endpoint: ${path}`)
            console.log('Agents API Response Type:', typeof response.data)
            
            let rawAgents = []
            if (Array.isArray(response.data)) {
              rawAgents = response.data
            } else if (response.data && Array.isArray(response.data.results)) {
              rawAgents = response.data.results
            } else if (response.data && Array.isArray(response.data.agents)) {
              rawAgents = response.data.agents
            } else {
              console.error('Unexpected agents API response format:', response.data)
              this.error = `Unexpected format on ${path}: ${typeof response.data}`
              this.agents = []
              return // Stop if we got a 200 but data is weird
            }
            
            // Map agent_id to id if id is missing or null
            this.agents = rawAgents.map((a: any) => ({
              ...a,
              id: a.id || a.agent_id
            }))
            
            this.error = null
            this.loading = false
            this.discoveredBasePath = path
            localStorage.setItem('discoveredBasePath', path)
            return // Success!
          } else {
            console.warn(`Endpoint ${path} returned ${response.status}`)
            lastError = `Server returned ${response.status} on all attempted endpoints.`
          }
        } catch (err: any) {
          console.error(`Error on endpoint ${path}:`, err)
          lastError = err.message || 'Network error during discovery'
        }
      }

      this.error = lastError
      this.agents = []
      this.loading = false
    },
    async getMeshUrl(agentId: number | string, mode: 'control' | 'terminal' | 'file') {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return null

      // Mapping mode to MeshCentral viewmode
      const modeMap = {
        'control': '11',
        'terminal': '12',
        'file': '13'
      }
      const viewmode = modeMap[mode] || '11'

      // Potential token/mesh endpoints - prioritizing official v3 token endpoint
      const endpoints = [
        `/api/v3/agents/${agentId}/token/`,
        `${this.discoveredBasePath}${agentId}/meshcentral/`,
        `${this.discoveredBasePath}${agentId}/token/`,
        `/api/v3/agents/${agentId}/meshcentral/`,
        `/api/v3/agents/`, // Fallback for some versions
      ]

      console.log(`Starting MeshCentral discovery for agent ${agentId} (mode: ${mode})...`)

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
          
          console.log(`Trying mesh/token endpoint: ${path}`)
          const response = await CapacitorHttp.get(options)
          
          if (response.status === 200) {
            let finalUrl = ''
            
            // Case 1: API returns a full URL or mode-specific URLs
            const rawUrl = response.data?.[mode] || response.data?.url
            if (rawUrl) {
              console.log(`API returned URL for ${mode}: ${rawUrl}`)
              
              if (rawUrl.includes('mesh.gaulabs.com')) {
                // Tactical API returns a perfectly formed string with base64 token.
                // We MUST NO re-parse with URL() as it breaks the token encoding.
                let refined = rawUrl
                
                // Ensure correct viewmode for our request
                if (refined.includes('viewmode=')) {
                  refined = refined.replace(/viewmode=\d+/, `viewmode=${viewmode}`)
                } else {
                  refined += `&viewmode=${viewmode}`
                }
                
                // Add mobile and touch flags for better UI/controls
                if (!refined.includes('mobile=')) refined += '&mobile=1'
                if (!refined.includes('touch=')) refined += '&touch=1'
                
                // Add embedded=1 for better UI/performance in iframe
                if (refined.includes('embedded=')) {
                  refined = refined.replace(/embedded=\d+/, 'embedded=1')
                } else {
                  refined += '&embedded=1'
                }

                // Restore hide=31 for production look (unless user wanted debug)
                if (refined.includes('hide=')) {
                  refined = refined.replace(/hide=\d+/, 'hide=31')
                } else {
                  refined += '&hide=31'
                }

                // Add starget=1 for silent target behavior
                if (!refined.includes('starget=')) {
                  refined += '&starget=1'
                }

                finalUrl = refined
                console.log(`Final Mobile Mesh URL: ${finalUrl}`)
              } else {
                finalUrl = rawUrl
              }
            }
            
            // Case 2: API returns a token structure
            if (!finalUrl) {
              const token = response.data?.token || response.data?.login_token
              const nodeid = response.data?.nodeid || response.data?.mesh_node_id || agentId
              
              if (token) {
                // Construct manually with mobile and touch flags
                finalUrl = `https://mesh.gaulabs.com/?login=${token}&gotonode=${nodeid}&viewmode=${viewmode}&hide=31&embedded=1&starget=1&mobile=1&touch=1`
                console.log(`Constructed Mobile Mesh URL from token: ${finalUrl}`)
              }
            }

            if (finalUrl) {
              // --- COOKIE PRIMING ---
              // By making a native HTTP request first, we "prime" the native cookie jar 
              // with the session cookie. Capacitor 5+ shares this jar with the WebView.
              // IMPORTANT: disableRedirects: true prevents "consuming" one-time login tokens.
              try {
                console.log(`Priming Mesh cookies for ${finalUrl}`)
                await CapacitorHttp.get({ 
                  url: finalUrl,
                  disableRedirects: true // Capture cookie without consuming token!
                })
              } catch (e) {
                console.warn('Cookie priming failed, proceeding anyway:', e)
              }
              return finalUrl
            }
          }
          console.warn(`Endpoint ${path} returned status ${response.status}`, response.data)
        } catch (err: any) {
          console.error(`Error on endpoint ${path}:`, err)
        }
      }

      console.error('All MeshCentral discovery attempts failed.')
      return null
    },
  },
})
