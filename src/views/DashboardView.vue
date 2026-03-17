<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Dynamic Header -->
      <div class="col-12 q-mb-md">
        <div class="column">
          <div class="text-h4 text-weight-bold tracking-tight">
            Good <span class="text-primary">{{ timeOfDay }}</span>, Operator
          </div>
          <div class="text-subtitle1 text-grey-5">System status overview for your fleet.</div>
        </div>
      </div>

      <!-- Hero Stats -->
      <div class="col-12 col-md-4">
        <q-card flat class="glass-card full-height overflow-hidden">
          <q-card-section class="q-pa-lg">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-primary">Fleet Scale</div>
                <div class="text-h3 text-weight-bolder">{{ agentStore.agents.length }}</div>
                <div class="text-caption text-grey-6">Managed Endpoints</div>
              </div>
              <q-icon name="hub" size="64px" class="opacity-1 text-primary" />
            </div>
          </q-card-section>
          <div class="absolute-bottom bg-primary opacity-2" style="height: 4px"></div>
        </q-card>
      </div>

      <div class="col-6 col-md-4">
        <q-card flat class="glass-card full-height overflow-hidden">
          <q-card-section class="q-pa-lg">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-positive">Live Status</div>
                <div class="text-h3 text-weight-bold text-positive">{{ onlineCount }}</div>
                <div class="text-caption text-grey-6">Online Now</div>
              </div>
              <q-icon name="sensors" size="64px" class="opacity-1 text-positive pulse-emerald" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-4">
        <q-card flat class="glass-card full-height overflow-hidden">
          <q-card-section class="q-pa-lg">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-negative">Critical</div>
                <div class="text-h3 text-weight-bold text-negative">{{ offlineCount }}</div>
                <div class="text-caption text-grey-6">Offline / Unreachable</div>
              </div>
              <q-icon name="warning" size="64px" class="opacity-1 text-negative" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity Feed -->
      <div class="col-12 q-mt-xl">
        <div class="row items-center q-mb-md">
          <q-icon name="history" size="sm" class="text-grey-5 q-mr-sm" />
          <div class="text-h5 text-weight-bold">Recent Pulse</div>
          <q-space />
          <q-btn flat dense color="primary" label="View All" @click="router.push('/agents')" />
        </div>

        <q-list class="glass-card q-pa-sm overflow-hidden">
          <q-item v-for="agent in recentAgents" :key="agent.id" clickable v-ripple @click="router.push({ name: 'agent-details', params: { id: agent.id }})" class="q-my-xs rounded-borders">
            <q-item-section avatar>
              <div class="status-dot-container">
                <div :class="['status-dot', agent.status === 'online' ? 'bg-positive pulse-emerald' : 'bg-negative']"></div>
              </div>
            </q-item-section>
            
            <q-item-section>
              <q-item-label class="text-weight-bold text-white">{{ agent.hostname }}</q-item-label>
              <q-item-label caption class="text-grey-5">{{ agent.client_name }} > {{ agent.site_name }}</q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <div class="column items-end">
                <div class="text-caption text-grey-6">{{ agent.operating_system }}</div>
                <q-icon :name="agent.status === 'online' ? 'check_circle' : 'error'" :color="agent.status === 'online' ? 'positive' : 'negative'" size="xs" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
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

const onlineCount = computed(() => agentStore.agents.filter(a => a.status === 'online').length)
const offlineCount = computed(() => agentStore.agents.filter(a => a.status === 'offline').length)
const recentAgents = computed(() => agentStore.agents.slice(0, 8))

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
})

onMounted(() => {
  agentStore.fetchAgents()
})
</script>

<style scoped>
.tracking-tight {
  letter-spacing: -0.025em;
}

.opacity-1 {
  opacity: 0.1;
}

.opacity-2 {
  opacity: 0.2;
}

.status-dot-container {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.rounded-borders {
  border-radius: 12px;
}
</style>
