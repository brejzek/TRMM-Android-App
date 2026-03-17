<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-md">
      <!-- Search & Filter Area -->
      <div class="row q-col-gutter-sm items-center">
        <div class="col">
          <q-input
            v-model="search"
            placeholder="Search agents..."
            dense
            outlined
            bg-color="white"
            class="standard-card"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn flat round icon="filter_list" color="grey-7" />
        </div>
      </div>

      <!-- Fleet Count -->
      <div class="text-caption text-slate-500 uppercase tracking-widest q-ml-xs">
        {{ filteredAgents.length }} Operational Assets
      </div>

      <!-- Agent List -->
      <div v-if="filteredAgents.length > 0" class="column q-gutter-y-sm">
        <q-card 
          v-for="agent in filteredAgents" 
          :key="agent.id" 
          class="standard-card cursor-pointer" 
          flat 
          @click="viewAgent(agent)"
        >
          <q-item class="q-pa-md">
            <q-item-section avatar>
              <q-icon 
                :name="getOSIcon(agent.operating_system)" 
                :color="agent.status === 'online' ? 'primary' : 'grey-4'" 
                size="md" 
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-slate-900">{{ agent.hostname }}</q-item-label>
              <q-item-label caption class="text-slate-500">{{ agent.public_ip }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div :class="['status-pill', `status-${agent.status}-bg`]">
                {{ agent.status }}
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-center q-pa-xl column text-slate-400">
        <q-icon name="devices_other" size="64px" class="q-mb-md opacity-2" />
        <div class="text-subtitle1">No assets found in current sector</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore, type Agent } from '../stores/agents'

const router = useRouter()
const agentStore = useAgentStore()

const search = ref('')
const agents = computed(() => agentStore.agents)

const filteredAgents = computed(() => {
  if (!search.value) return agents.value
  const s = search.value.toLowerCase()
  return agents.value.filter(a => 
    a.hostname.toLowerCase().includes(s) || 
    a.public_ip.toLowerCase().includes(s) ||
    a.operating_system.toLowerCase().includes(s)
  )
})

function getOSIcon(os: string) {
  const lowOs = os.toLowerCase()
  if (lowOs.includes('windows')) return 'window'
  if (lowOs.includes('linux')) return 'computer'
  if (lowOs.includes('mac') || lowOs.includes('darwin')) return 'apple'
  return 'settings_input_component'
}

function viewAgent(agent: Agent) {
  router.push({ name: 'agent-details', params: { id: agent.id } })
}

onMounted(() => {
  agentStore.fetchAgents()
})
</script>

<style scoped>
.tracking-widest { letter-spacing: 0.1em; }
.uppercase { text-transform: uppercase; }
.opacity-2 { opacity: 0.2; }

.status-online-bg { background: #dcfce7; color: #166534; }
.status-offline-bg { background: #fee2e2; color: #991b1b; }
.status-overdue-bg { background: #fef3c7; color: #92400e; }

.text-slate-900 { color: #0f172a; }
.text-slate-500 { color: #64748b; }
.text-slate-400 { color: #94a3b8; }
</style>
