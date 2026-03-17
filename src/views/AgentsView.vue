<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-lg">
      <!-- Header & Search -->
      <div class="row items-center no-wrap">
        <div class="column">
          <div class="text-h4 text-weight-bolder">Endpoints</div>
          <div class="text-caption text-grey-5">{{ agentStore.agents.length }} Devices Managed</div>
        </div>
        <q-space />
        <q-btn 
          flat 
          round 
          icon="refresh" 
          color="primary" 
          class="glass-card"
          :loading="agentStore.loading" 
          @click="agentStore.fetchAgents" 
        />
      </div>

      <q-input
        v-model="search"
        placeholder="Filter by hostname, client, or site..."
        borderless
        dense
        class="glass-card q-px-md q-py-sm"
        input-class="text-white"
        placeholder-class="text-grey-6"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>

      <!-- Agent Grid -->
      <div v-if="filteredAgents.length === 0 && !agentStore.loading" class="flex flex-center q-pa-xl text-center">
        <div class="column items-center opacity-2">
          <q-icon name="search_off" size="64px" />
          <div class="text-h6 q-mt-md">No Matching Endpoints</div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div 
          v-for="agent in filteredAgents" 
          :key="agent.id" 
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card 
            flat 
            @click="viewAgent(agent)" 
            class="glass-card agent-card cursor-pointer full-height"
            v-ripple
          >
            <q-card-section class="q-pa-md">
              <div class="row items-start no-wrap">
                <!-- OS Icon (Ref Screenshot 1) -->
                <q-item-section avatar class="q-pr-md" style="min-width: 48px">
                  <q-icon :name="getOSIcon(agent.operating_system)" color="primary" size="32px" />
                </q-item-section>

                <q-item-section>
                  <div class="text-h6 text-weight-bold hostname-text ellipsis">{{ agent.hostname }}</div>
                  <div class="text-caption text-grey-5">{{ agent.client_name }} / {{ agent.site_name }}</div>
                  
                  <!-- Relative Time (Ref Screenshot 1) -->
                  <div class="row items-center q-mt-xs text-grey-6 text-caption">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    <span>{{ getRelativeTime(agent.last_seen) }}</span>
                  </div>
                </q-item-section>

                <q-item-section side top>
                  <q-chip 
                    dense 
                    class="status-chip-ref"
                    :color="getStatusBgColor(agent.status)"
                    text-color="white"
                  >
                    <div :class="['pulse-dot q-mr-xs', getStatusPulseClass(agent.status)]"></div>
                    {{ agent.status.toUpperCase() }}
                  </q-chip>
                  
                  <q-btn flat round dense icon="expand_more" color="grey-7" class="q-mt-sm" />
                </q-item-section>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <q-inner-loading :showing="agentStore.loading" class="bg-transparent">
      <q-spinner-dots size="64px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore, type Agent } from '../stores/agents'

const router = useRouter()
const agentStore = useAgentStore()
const search = ref('')

const filteredAgents = computed(() => {
  if (!search.value) return agentStore.agents
  const s = search.value.toLowerCase()
  return agentStore.agents.filter(a => 
    a.hostname.toLowerCase().includes(s) || 
    a.client_name.toLowerCase().includes(s) ||
    a.site_name.toLowerCase().includes(s)
  )
})

function getStatusPulseClass(status: string) {
  switch (status.toLowerCase()) {
    case 'online': return 'pulse-emerald bg-positive'
    case 'offline': return 'bg-negative'
    case 'overdue': return 'bg-warning'
    default: return 'bg-grey'
  }
}

function getStatusBgColor(status: string) {
  switch (status.toLowerCase()) {
    case 'online': return 'green-10'
    case 'overdue': return 'orange-10'
    default: return 'grey-9'
  }
}

function getRelativeTime(timestamp: string) {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return timestamp // Return as is if already relative or invalid
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return 'Now'
  if (diffInMinutes < 60) return `${diffInMinutes} m ago`
  if (diffInHours < 24) return `${diffInHours} h ago`
  return `${diffInDays} days ago`
}

function getOSIcon(os: string) {
  const o = os.toLowerCase()
  if (o.includes('win')) return 'window'
  if (o.includes('mac') || o.includes('apple')) return 'apple'
  if (o.includes('linux')) return 'terminal'
  return 'devices'
}

function viewAgent(agent: Agent) {
  router.push({ name: 'agent-details', params: { id: agent.id } })
}

onMounted(() => {
  agentStore.fetchAgents()
})
</script>

<style scoped>
.agent-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hostname-text {
  line-height: 1.2;
  margin-bottom: 2px;
}

.status-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  margin-left: 8px;
}

.status-chip-ref {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid currentColor;
  font-weight: 700;
  font-size: 10px;
  padding: 2px 8px;
  height: 22px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.opacity-1 { opacity: 0.1; }
.opacity-2 { opacity: 0.2; }
</style>
