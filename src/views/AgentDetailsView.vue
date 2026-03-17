<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-xl">
      <q-btn flat round icon="arrow_back" color="primary" class="glass-card q-mr-md" @click="router.back()" />
      <div class="column">
        <div class="text-h4 text-weight-bolder">Agent Intelligence</div>
        <div class="text-caption text-grey-5" v-if="agent">{{ agent.hostname }} • {{ agent.public_ip }}</div>
      </div>
    </div>

    <div v-if="agent" class="column q-gutter-y-lg">
      <q-card flat class="glass-card overflow-hidden">
        <q-card-section class="q-pa-lg">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ agent.hostname }}</div>
              <div class="text-subtitle1 text-grey-5">{{ agent.client_name }} > {{ agent.site_name }}</div>
            </div>
            <div class="col-auto">
              <q-chip 
                dense 
                size="md" 
                class="glass-chip q-px-md"
                :text-color="getStatusColor(agent.status)"
                outline
              >
                <div :class="['status-pulse-small q-mr-sm', getStatusPulseClass(agent.status)]"></div>
                {{ agent.status.toUpperCase() }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator dark class="opacity-1" />

        <q-tabs v-model="tab" class="text-primary overhaul-tabs" align="justify" indicator-color="primary">
          <q-tab name="info" icon="analytics" label="Overview" />
          <q-tab name="remote" icon="vignette" label="Remote" />
          <q-tab name="terminal" icon="code" label="Terminal" />
        </q-tabs>

        <q-separator dark class="opacity-1" />

        <q-tab-panels v-model="tab" animated class="bg-transparent agent-panels">
          <q-tab-panel name="info" class="q-pa-lg">
            <!-- Metadata List (Ref Screenshot 2) -->
            <div class="column q-gutter-y-md">
              <div class="row items-center no-wrap">
                <q-icon name="account_tree" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Type</div>
                  <div class="text-subtitle1 text-weight-bold">Workstation</div>
                </div>
              </div>

              <div class="row items-center no-wrap">
                <q-icon name="schedule" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Last Connection</div>
                  <div class="text-subtitle1 text-weight-bold">Now</div>
                </div>
              </div>

              <div class="row items-center no-wrap">
                <q-icon name="power_settings_new" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Boot Time</div>
                  <div class="text-subtitle1 text-weight-bold">2/7/2026 20:49</div>
                </div>
              </div>

              <div class="row items-center no-wrap">
                <q-icon name="computer" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Operating System</div>
                  <div class="text-subtitle1 text-weight-bold">{{ agent.operating_system }}</div>
                </div>
              </div>

              <div class="row items-center no-wrap">
                <q-icon name="info" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Version</div>
                  <div class="text-subtitle1 text-weight-bold">{{ agent.version }}</div>
                </div>
              </div>

              <div class="row items-center no-wrap">
                <q-icon name="public" color="primary" size="sm" class="q-mr-md" />
                <div class="column">
                  <div class="text-overline text-grey-6 leading-tight">Public IP</div>
                  <div class="text-subtitle1 text-weight-bold text-primary">{{ agent.public_ip }}</div>
                </div>
              </div>
            </div>

            <!-- Health Status Board (Reference Alignment) -->
            <div class="q-mt-xl">
              <div class="row items-center q-mb-md">
                <q-icon name="check_circle_outline" color="positive" size="sm" class="q-mr-sm" />
                <div class="text-h6 text-weight-bold">Check Status</div>
              </div>
              
              <div class="row q-col-gutter-md">
                <div class="col-6 col-sm-3">
                  <div class="health-tile glass-panel text-center q-pa-md border-primary shadow-glow-primary">
                    <div class="text-h4 text-weight-bolder text-primary">{{ agent.checks?.total || 0 }}</div>
                    <div class="text-overline text-grey-5">Total</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="health-tile glass-panel text-center q-pa-md border-warning">
                    <div class="text-h4 text-weight-bolder text-warning">{{ agent.checks?.warning || 0 }}</div>
                    <div class="text-overline text-grey-5">Warnings</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="health-tile glass-panel text-center q-pa-md border-positive">
                    <div class="text-h4 text-weight-bolder text-positive">{{ agent.checks?.info || 0 }}</div>
                    <div class="text-overline text-grey-5">Info</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="health-tile glass-panel text-center q-pa-md border-negative">
                    <div class="text-h4 text-weight-bolder text-negative">{{ agent.checks?.failing || 0 }}</div>
                    <div class="text-overline text-grey-5">Failed</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="q-mt-xl">
              <div class="text-h6 text-weight-bold q-mb-md">Quick Operations</div>
              <div class="row q-gutter-md">
                <q-btn unelevated color="primary" icon="bolt" label="Wake" class="glass-pill q-px-lg" />
                <q-btn outline color="warning" icon="restart_alt" label="Reboot" class="glass-pill q-px-lg" @click="sendCommand('reboot')" />
                <q-btn outline color="negative" icon="power_settings_new" label="Shutdown" class="glass-pill q-px-lg" @click="sendCommand('shutdown')" />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="remote" class="no-padding overflow-hidden bg-black full-screen-tab">
            <div v-if="meshLoading" class="flex flex-center full-height full-width q-pa-xl">
              <q-spinner-puff color="primary" size="4em" />
              <div class="q-ml-md text-white text-h6">Establishing Secure Link...</div>
            </div>
            <div v-else-if="remoteUrl" class="full-height relative-position">
              <iframe 
                :src="remoteUrl" 
                class="mesh-iframe"
                allow="fullscreen; autoplay; camera; microphone; clipboard-read; clipboard-write; display-capture"
              ></iframe>
              
              <q-page-sticky position="bottom-right" :offset="[24, 24]">
                <q-fab
                  color="primary"
                  icon="keyboard_arrow_up"
                  direction="up"
                  vertical-actions-align="right"
                  class="glass-panel main-action-fab"
                >
                  <q-fab-action color="purple-7" @click="sendCommand('maintenance')" icon="build" label="Enter Maintenance Mode" />
                  <q-fab-action color="negative" @click="sendCommand('shutdown')" icon="power_settings_new" label="Shutdown" />
                  <q-fab-action color="orange-8" @click="sendCommand('reboot')" icon="restart_alt" label="Restart" />
                  <q-fab-action color="teal" @click="tab = 'terminal'" icon="terminal" label="Terminal" />
                  <q-fab-action color="indigo-7" @click="fetchMeshUrl('control')" icon="vignette" label="MeshCentral" />
                  <q-fab-action color="green-7" @click="sendCommand('software')" icon="download" label="Install Software" />
                  <q-fab-action color="purple-9" @click="sendCommand('processes')" icon="list_alt" label="Processes/Services" />
                  <q-fab-action color="cyan-7" @click="sendCommand('script')" icon="code" label="Run Script" />
                  <q-fab-action color="secondary" @click="toggleKeyboard" icon="keyboard" label="Keyboard" />
                </q-fab>
              </q-page-sticky>
            </div>
            <div v-else class="flex flex-center q-pa-xl text-center full-height text-white">
              <q-icon name="error_outline" color="negative" size="4em" />
              <div class="text-h5 q-mt-md">Link Failure</div>
              <q-btn flat color="primary" label="Re-establish Bridge" @click="fetchMeshUrl('control')" class="q-mt-md" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="terminal" class="no-padding overflow-hidden bg-black full-screen-tab">
            <div v-if="meshLoading" class="flex flex-center full-height full-width q-pa-xl">
              <q-spinner-terminal color="primary" size="4em" />
              <div class="q-ml-md text-white text-h6">Opening Shell...</div>
            </div>
            <div v-else-if="terminalUrl" class="full-height relative-position">
              <iframe 
                :src="terminalUrl" 
                class="mesh-iframe"
                allow="fullscreen; autoplay; camera; microphone; clipboard-read; clipboard-write; display-capture"
              ></iframe>

              <q-page-sticky position="bottom-right" :offset="[24, 24]">
                <q-fab
                  color="primary"
                  icon="keyboard_arrow_up"
                  direction="up"
                  vertical-actions-align="right"
                  class="glass-panel main-action-fab"
                >
                  <q-fab-action color="purple-7" @click="sendCommand('maintenance')" icon="build" label="Enter Maintenance Mode" />
                  <q-fab-action color="negative" @click="sendCommand('shutdown')" icon="power_settings_new" label="Shutdown" />
                  <q-fab-action color="orange-8" @click="sendCommand('reboot')" icon="restart_alt" label="Restart" />
                  <q-fab-action color="teal" @click="fetchMeshUrl('terminal')" icon="terminal" label="Terminal" />
                  <q-fab-action color="indigo-7" @click="tab = 'remote'" icon="vignette" label="MeshCentral" />
                  <q-fab-action color="green-7" @click="sendCommand('software')" icon="download" label="Install Software" />
                  <q-fab-action color="purple-9" @click="sendCommand('processes')" icon="list_alt" label="Processes/Services" />
                  <q-fab-action color="cyan-7" @click="sendCommand('script')" icon="code" label="Run Script" />
                  <q-fab-action color="secondary" @click="toggleKeyboard" icon="keyboard" label="Keyboard" />
                </q-fab>
              </q-page-sticky>
            </div>
            <div v-else class="flex flex-center q-pa-xl text-center full-height text-white">
              <q-icon name="terminal" color="negative" size="4em" />
              <div class="text-h5 q-mt-md">Shell Disconnected</div>
              <q-btn flat color="primary" label="Reconnect" @click="fetchMeshUrl('terminal')" class="q-mt-md" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>

      <!-- Hidden Keyboard Anchor -->
      <input 
        ref="keyboardAnchor" 
        type="text" 
        class="keyboard-anchor"
        aria-hidden="true"
      />
    </div>

    <div v-else class="flex flex-center q-pa-xl">
      <q-inner-loading showing>
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentStore } from '../stores/agents'
import { useQuasar } from 'quasar'
import { Keyboard } from '@capacitor/keyboard'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const agentStore = useAgentStore()

const tab = ref('info')
const meshLoading = ref(false)
const remoteUrl = ref('')
const terminalUrl = ref('')
const keyboardAnchor = ref<HTMLInputElement | null>(null)

const agentId = computed(() => route.params.id as string)
const agent = computed(() => agentStore.agents.find(a => String(a.id) === agentId.value || String(a.agent_id) === agentId.value))

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

async function fetchMeshUrl(mode: 'control' | 'terminal') {
  meshLoading.value = true
  try {
    const url = await agentStore.getMeshUrl(agentId.value, mode === 'control' ? 'control' : 'terminal')
    if (url) {
      if (mode === 'control') remoteUrl.value = url
      else terminalUrl.value = url
    } else {
      throw new Error('No URL returned from API')
    }
  } catch (error) {
    console.error(`Failed to fetch ${mode} URL:`, error)
    $q.notify({
      type: 'negative',
      message: `Failed to load ${mode === 'control' ? 'Remote Desktop' : 'Terminal'}`,
      position: 'top'
    })
  } finally {
    meshLoading.value = false
  }
}

function sendCommand(cmd: string) {
  $q.notify({
    message: `Sending ${cmd} command to agent...`,
    color: 'info'
  })
  // We'll implement the actual API call later
}


async function toggleKeyboard() {
  try {
    // Hidden Input Bridge Strategy
    if (keyboardAnchor.value) {
      keyboardAnchor.value.focus()
    }
    await Keyboard.show()
  } catch (e) {
    console.error('Keyboard show failed', e)
  }
}

watch(tab, (newTab) => {
  if (newTab === 'remote' && !remoteUrl.value) {
    fetchMeshUrl('control')
  } else if (newTab === 'terminal' && !terminalUrl.value) {
    fetchMeshUrl('terminal')
  }
})

onMounted(() => {
  if (agentStore.agents.length === 0) {
    agentStore.fetchAgents()
  }
})
</script>

<style scoped>
.glass-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.status-pulse-small {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.overhaul-tabs {
  background: rgba(255, 255, 255, 0.02);
}

.agent-panels {
  min-height: 50vh;
}

.full-screen-tab {
  height: 70vh !important;
}

.mesh-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #000;
}

.info-block {
  transition: transform 0.2s ease;
}

.info-block:hover {
  transform: scale(1.02);
}

.glass-pill {
  border-radius: 20px;
  font-weight: 600;
}

.keyboard-anchor {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.health-tile {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255,255,255,0.05);
}

.health-tile:active {
  transform: scale(0.95);
}

.border-primary { border-color: var(--neon-indigo) !important; }
.border-warning { border-color: #f2c037 !important; }
.border-positive { border-color: #21ba45 !important; }
.border-negative { border-color: #c10015 !important; }

.shadow-glow-primary {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
}

.main-action-fab {
  z-index: 1000;
}
</style>
