<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-xl">
      <q-btn flat round icon="arrow_back" color="primary" class="glass-card q-mr-md" @click="router.back()" />
      <div class="column">
        <div class="text-h4 text-weight-bolder">Clients</div>
        <div class="text-caption text-grey-5">Manage fleet by organization</div>
      </div>
    </div>

    <div class="q-mb-lg">
      <q-input 
        v-model="search" 
        placeholder="Search clients..." 
        borderless
        class="glass-card q-px-md q-py-sm"
        input-class="text-white"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-tail size="64px" color="primary" />
    </div>

    <div v-else class="column q-gutter-y-md">
      <q-card v-for="client in filteredGroups" :key="client.name" class="glass-card overflow-hidden">
        <q-expansion-item
          group="clients"
          :label="client.name"
          header-class="q-pa-lg text-h6 text-weight-bold"
          expand-icon-class="text-primary"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="business" color="primary" text-color="white" class="glass-panel" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">{{ client.name }}</q-item-label>
              <q-item-label caption class="text-grey-5">
                {{ client.sites.length }} sites • {{ totalAgents(client) }} agents
              </q-item-label>
            </q-item-section>
          </template>

          <q-separator dark class="opacity-1" />

          <q-list class="q-px-md q-pb-md">
            <q-expansion-item
              v-for="site in client.sites"
              :key="site.name"
              dense
              class="q-mt-sm rounded-borders overflow-hidden"
              header-class="glass-panel text-subtitle1"
              :label="site.name"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="place" color="secondary" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ site.name }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ site.agents.length }} agents</q-item-label>
                </q-item-section>
              </template>

              <q-list padding class="q-pl-lg">
                <q-item 
                  v-for="agent in site.agents" 
                  :key="agent.id" 
                  clickable 
                  v-ripple
                  class="rounded-borders q-my-xs"
                  @click="router.push(`/agents/${agent.id}`)"
                >
                  <q-item-section avatar>
                    <q-icon 
                      :name="agent.operating_system.toLowerCase().includes('windows') ? 'window' : 'computer'" 
                      :color="getStatusColor(agent.status)" 
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ agent.hostname }}</q-item-label>
                    <q-item-label caption class="text-grey-6">{{ agent.public_ip }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div :class="['status-pulse-small', getStatusPulseClass(agent.status)]"></div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-expansion-item>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore, type ClientGroup } from '../stores/agents'

const router = useRouter()
const agentStore = useAgentStore()
const search = ref('')

const loading = computed(() => agentStore.loading)
const groups = computed(() => agentStore.getGroups)

const filteredGroups = computed(() => {
  if (!search.value) return groups.value
  const term = search.value.toLowerCase()
  return groups.value.filter(g => 
    g.name.toLowerCase().includes(term) || 
    g.sites.some(s => s.name.toLowerCase().includes(term))
  )
})

function totalAgents(client: ClientGroup) {
  return client.sites.reduce((acc, s) => acc + s.agents.length, 0)
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'online': return 'positive'
    case 'offline': return 'negative'
    case 'overdue': return 'warning'
    default: return 'grey'
  }
}

function getStatusPulseClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'online': return 'pulse-emerald bg-positive'
    case 'offline': return 'bg-negative'
    case 'overdue': return 'bg-warning'
    default: return 'bg-grey'
  }
}
</script>

<style scoped>
.opacity-1 { opacity: 0.1; }
.status-pulse-small {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
