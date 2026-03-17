<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-lg">
      <!-- Minimalist Header -->
      <div class="row items-center">
        <div class="column">
          <div class="text-h5 text-weight-bold tracking-tight text-slate-900 leading-tight">
            {{ greeting }}, Chief
          </div>
          <div class="text-caption text-slate-500 q-mt-xs">Fleet Operational Status</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" color="grey-6" :loading="loading" @click="agentStore.fetchAgents" />
      </div>

      <!-- High-Level Health Grid -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-card class="standard-card q-pa-md text-center" flat>
            <div class="text-caption text-slate-500 uppercase tracking-widest q-mb-xs">Healthy</div>
            <div class="text-h4 text-weight-bold text-emerald-600">{{ onlineCount }}</div>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="standard-card q-pa-md text-center" flat>
            <div class="text-caption text-slate-500 uppercase tracking-widest q-mb-xs">Warning</div>
            <div class="text-h4 text-weight-bold text-amber-600">{{ overdueCount }}</div>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="standard-card q-pa-md text-center" flat>
            <div class="text-caption text-slate-500 uppercase tracking-widest q-mb-xs">Critical</div>
            <div class="text-h4 text-weight-bold text-rose-600">{{ offlineCount }}</div>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="standard-card q-pa-md text-center" flat>
            <div class="text-caption text-slate-500 uppercase tracking-widest q-mb-xs">Total</div>
            <div class="text-h4 text-weight-bold text-slate-900">{{ agents.length }}</div>
          </q-card>
        </div>
      </div>

      <!-- Simple Activity Feed -->
      <div class="column q-gutter-y-sm">
        <div class="text-overline text-slate-400">Recent Pulse</div>
        <q-card v-for="agent in recentAgents" :key="agent.id" class="standard-card q-pa-sm" flat @click="router.push({ name: 'agent-details', params: { id: agent.id }})">
          <q-item clickable>
            <q-item-section avatar>
              <div 
                :style="{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(agent.status) }"
              ></div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-semi text-slate-800">{{ agent.hostname }}</q-item-label>
              <q-item-label caption class="text-slate-500">Checked in {{ agent.last_seen }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore } from '../stores/agents'

const router = useRouter()
const agentStore = useAgentStore()
const agents = computed(() => agentStore.agents)
const loading = computed(() => agentStore.loading)

const onlineCount = computed(() => agents.value.filter(a => a.status === 'online').length)
const offlineCount = computed(() => agents.value.filter(a => a.status === 'offline').length)
const overdueCount = computed(() => agents.value.filter(a => a.status === 'overdue').length)

const recentAgents = computed(() => {
  return [...agents.value]
    .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
    .slice(0, 5)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

function getStatusColor(status: string) {
  switch (status) {
    case 'online': return '#10b981'
    case 'offline': return '#ef4444'
    case 'overdue': return '#f59e0b'
    default: return '#94a3b8'
  }
}

onMounted(() => {
  agentStore.fetchAgents()
})
</script>

<style scoped>
.leading-tight { line-height: 1.25; }
.tracking-widest { letter-spacing: 0.1em; }
.uppercase { text-transform: uppercase; }

.text-emerald-600 { color: #059669; }
.text-amber-600 { color: #d97706; }
.text-rose-600 { color: #e11d48; }
.text-slate-900 { color: #0f172a; }
.text-slate-800 { color: #1e293b; }
.text-slate-500 { color: #64748b; }
.text-slate-400 { color: #94a3b8; }
</style>
