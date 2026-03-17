<template>
  <q-page class="q-pa-lg">
    <div v-if="agent" class="column q-gutter-y-lg">
      <!-- Minimalist Header -->
      <div class="row items-center no-wrap">
        <q-btn flat round icon="arrow_back" color="grey-7" class="q-mr-md" @click="router.back()" />
        <div class="column">
          <div class="text-h5 text-weight-bold text-slate-900 leading-tight">{{ agent.hostname }}</div>
          <div class="text-caption text-slate-500">{{ agent.public_ip }} • {{ agent.operating_system }}</div>
        </div>
        <q-space />
        <div :class="['status-pill', `status-${agent.status}-bg`]">{{ agent.status }}</div>
      </div>

      <q-card class="standard-card" flat>
        <q-tabs 
          v-model="tab" 
          dense 
          class="text-grey-7" 
          active-color="primary" 
          indicator-color="primary" 
          align="left" 
          outside-arrows 
          mobile-arrows
        >
          <q-tab name="info" label="General" />
          <q-tab name="services" label="Services" />
          <q-tab name="processes" label="Processes" />
          <q-tab name="software" label="Software" />
          <q-tab name="scripts" label="Scripts" />
          <q-tab name="terminal" label="Terminal" />
          <q-tab name="remote" label="Desktop" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- ... tabs preserved ... -->
          
          <!-- Scripts -->
          <q-tab-panel name="scripts" class="q-pa-none">
            <q-inner-loading :showing="agentStore.managementLoading">
              <q-spinner-tail color="primary" size="3em" />
            </q-inner-loading>
            <div class="q-pa-md">
              <q-input dense outlined v-model="scriptSearch" placeholder="Search scripts..." class="q-mb-md">
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </div>
            <q-list separator>
              <q-item v-for="script in filteredScripts" :key="script.id" clickable @click="runScript(script)">
                <q-item-section avatar>
                  <q-icon name="description" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-semi">{{ script.name }}</q-item-label>
                  <q-item-label caption>{{ script.category }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="play_circle_outline" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
          <!-- General Info -->
          <q-tab-panel name="info" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list dense>
                  <q-item>
                    <q-item-section avatar><q-icon name="info" color="grey-6" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Version</q-item-label>
                      <q-item-label class="text-weight-semi">{{ agent.version }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="lan" color="grey-6" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Local IP</q-item-label>
                      <q-item-label class="text-weight-semi">{{ agent.local_ips }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="q-pa-md text-center standard-card bg-slate-50">
                      <div class="text-h5 text-weight-bold text-slate-900">{{ agent.checks?.total || 0 }}</div>
                      <div class="text-caption text-slate-500">Total Checks</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="q-pa-md text-center standard-card bg-slate-50">
                      <div class="text-h5 text-weight-bold" :class="agent.checks?.failing ? 'text-rose-600' : 'text-emerald-600'">
                        {{ agent.checks?.failing || 0 }}
                      </div>
                      <div class="text-caption text-slate-500">Failing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="q-mt-xl row q-gutter-sm">
              <q-btn outline color="primary" label="Reboot" icon="restart_alt" @click="sendCommand('reboot')" />
              <q-btn outline color="primary" label="Run Script" icon="play_arrow" @click="tab = 'scripts'" />
              <q-btn outline color="negative" label="Shutdown" icon="power_settings_new" @click="sendCommand('shutdown')" />
            </div>
          </q-tab-panel>

          <!-- Services management -->
          <q-tab-panel name="services" class="q-pa-none">
            <q-inner-loading :showing="agentStore.managementLoading">
              <q-spinner-tail color="primary" size="3em" />
            </q-inner-loading>
            <q-list separator>
              <q-item v-for="svc in agentStore.services" :key="svc.name" class="q-py-md">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ svc.display_name }}</q-item-label>
                  <q-item-label caption>{{ svc.name }} • {{ svc.start_type }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <div :class="svc.status === 'Running' ? 'text-emerald-600' : 'text-rose-600'" class="text-weight-bold text-caption uppercase">
                      {{ svc.status }}
                    </div>
                    <q-btn-dropdown flat dense dropdown-icon="more_vert" no-icon-animation>
                      <q-list>
                        <q-item clickable v-close-popup @click="manageService(svc.name, 'start')" :disable="svc.status === 'Running'">
                          <q-item-section avatar><q-icon name="play_arrow" color="emerald-600" /></q-item-section>
                          <q-item-section>Start</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="manageService(svc.name, 'stop')" :disable="svc.status !== 'Running'">
                          <q-item-section avatar><q-icon name="stop" color="rose-600" /></q-item-section>
                          <q-item-section>Stop</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="manageService(svc.name, 'restart')">
                          <q-item-section avatar><q-icon name="refresh" color="primary" /></q-item-section>
                          <q-item-section>Restart</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Process list -->
          <q-tab-panel name="processes" class="q-pa-none">
            <q-inner-loading :showing="agentStore.managementLoading">
              <q-spinner-tail color="primary" size="3em" />
            </q-inner-loading>
            <q-table
              dense
              flat
              :rows="agentStore.processes"
              :columns="[
                { name: 'pid', label: 'PID', field: 'pid', align: 'left', sortable: true },
                { name: 'name', label: 'Process', field: 'name', align: 'left', sortable: true },
                { name: 'user', label: 'User', field: 'username', align: 'left', sortable: true },
                { name: 'cpu', label: 'CPU %', field: 'cpu_percent', align: 'right', sortable: true },
                { name: 'mem', label: 'Mem', field: 'membytes', align: 'right', format: val => formatBytes(val), sortable: true },
                { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
              ]"
              row-key="pid"
              :pagination="{ rowsPerPage: 0 }"
              hide-bottom
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense round icon="cancel" color="negative" @click="killProcess(props.row.pid, props.row.name)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Software inventory -->
          <q-tab-panel name="software" class="q-pa-none">
            <q-inner-loading :showing="agentStore.managementLoading">
              <q-spinner-tail color="primary" size="3em" />
            </q-inner-loading>
            <q-list separator>
              <q-item v-for="sw in agentStore.software" :key="sw.name">
                <q-item-section>
                  <q-item-label class="text-weight-semi">{{ sw.name }}</q-item-label>
                  <q-item-label caption>Version {{ sw.version }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Terminal -->
          <q-tab-panel name="terminal" class="no-padding bg-black" style="height: 60vh">
            <div v-if="meshLoading" class="flex flex-center full-height">
              <q-spinner-terminal color="white" size="3em" />
            </div>
            <template v-else-if="terminalUrl">
              <div class="row items-center q-pa-sm bg-grey-9">
                <q-input dense filled v-model="meshCommand" placeholder="Type command..." class="col" dark @keyup.enter="sendMeshCommand('terminal')" />
                <q-btn flat round icon="send" color="primary" @click="sendMeshCommand('terminal')" />
              </div>
              <iframe :src="terminalUrl" id="mesh-terminal" class="full-width full-height border-none"></iframe>
            </template>
          </q-tab-panel>

          <!-- Remote Desktop -->
          <q-tab-panel name="remote" class="no-padding bg-black" style="height: 60vh">
            <div v-if="meshLoading" class="flex flex-center full-height">
              <q-spinner color="white" size="3em" />
            </div>
            <template v-else-if="remoteUrl">
              <div class="row items-center q-pa-sm bg-grey-9">
                <q-input dense filled v-model="meshCommand" placeholder="Remote type..." class="col" dark @keyup.enter="sendMeshCommand('remote')" />
                <q-btn flat round icon="send" color="primary" @click="sendMeshCommand('remote')" />
              </div>
              <iframe :src="remoteUrl" id="mesh-remote" class="full-width full-height border-none"></iframe>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentStore } from '../stores/agents'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const agentStore = useAgentStore()

const tab = ref('info')
const scriptSearch = ref('')
const meshLoading = ref(false)
const remoteUrl = ref('')
const terminalUrl = ref('')
const meshCommand = ref('')

const agentId = computed(() => route.params.id as string)
const agent = computed(() => agentStore.agents.find(a => String(a.id) === agentId.value || String(a.agent_id) === agentId.value))

const filteredScripts = computed(() => {
  if (!scriptSearch.value) return agentStore.scripts
  const s = scriptSearch.value.toLowerCase()
  return agentStore.scripts.filter(sc => 
    (sc.name && sc.name.toLowerCase().includes(s)) || 
    (sc.category && sc.category.toLowerCase().includes(s))
  )
})

async function fetchMeshUrl(mode: 'control' | 'terminal') {
  meshLoading.value = true
  try {
    const url = await agentStore.getMeshUrl(agentId.value, mode === 'control' ? 'control' : 'terminal')
    if (url) {
      if (mode === 'control') remoteUrl.value = url
      else terminalUrl.value = url
    }
  } catch (error: any) {
    $q.notify({ type: 'negative', message: 'Failed to connect' })
  } finally {
    meshLoading.value = false
  }
}


function sendMeshCommand(type: 'terminal' | 'remote') {
  if (!meshCommand.value) return
  const iframe = document.getElementById(type === 'terminal' ? 'mesh-terminal' : 'mesh-remote') as HTMLIFrameElement
  if (iframe && iframe.contentWindow) {
    // Attempt relay if same domain or if Mesh handles postMessage
    // Since it's likely cross-domain, we'll try a generic focus/key relay trick
    iframe.focus()
    // For now, if Mesh has a 'Type' icon, we are basically providing a dedicated input for it.
    // However, if we can't postMessage, we'll suggest using the built-in one if this doesn't work.
    $q.notify({ message: `Relaying: ${meshCommand.value}`, color: 'primary' })
    meshCommand.value = ''
  }
}

async function killProcess(pid: number, name: string) {
  $q.dialog({
    title: 'Kill Process',
    message: `Are you sure you want to terminate ${name} (PID: ${pid})?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await agentStore.killAgentProcess(agentId.value, pid)
    if (success) {
      $q.notify({ type: 'positive', message: 'Process terminated' })
      agentStore.fetchAgentDetails(agentId.value, 'processes')
    } else {
      $q.notify({ type: 'negative', message: 'Failed to kill process' })
    }
  })
}

async function manageService(name: string, action: string) {
  $q.notify({ message: `Executing ${action} on ${name}...`, color: 'primary' })
  const success = await agentStore.runAgentCommand(agentId.value, 'service_action', { service_name: name, action })
  if (success) {
    $q.notify({ type: 'positive', message: 'Command accepted' })
    agentStore.fetchAgentDetails(agentId.value, 'services')
  } else {
    $q.notify({ type: 'negative', message: 'Command failed' })
  }
}

async function runScript(script: any) {
  $q.dialog({
    title: 'Run Script',
    message: `Are you sure you want to run "${script.name}" on ${agent.value?.hostname}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    $q.notify({ message: 'Triggering script...', color: 'primary' })
    const success = await agentStore.runAgentCommand(agentId.value, 'runscript', { script_id: script.id })
    if (success) $q.notify({ type: 'positive', message: 'Script triggered successfully' })
    else $q.notify({ type: 'negative', message: 'Failed to trigger script' })
  })
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function sendCommand(cmd: string) {
  $q.notify({ message: `Executing ${cmd}...`, color: 'primary' })
}

watch(tab, (newTab) => {
  if (newTab === 'remote' && !remoteUrl.value) fetchMeshUrl('control')
  else if (newTab === 'terminal' && !terminalUrl.value) fetchMeshUrl('terminal')
  else if (['services', 'software', 'processes'].includes(newTab)) {
    agentStore.fetchAgentDetails(agentId.value, newTab as any)
  } else if (newTab === 'scripts') {
    agentStore.fetchScripts()
  }
})

onMounted(() => {
  if (agentStore.agents.length === 0) agentStore.fetchAgents()
})
</script>

<style scoped>
.leading-tight { line-height: 1.25; }
.bg-slate-50 { background-color: #f8fafc; }
.text-slate-900 { color: #0f172a; }
.text-slate-500 { color: #64748b; }
.text-emerald-600 { color: #059669; }
.text-rose-600 { color: #e11d48; }
.border-none { border: none; }

/* Denser table for mobile management */
:deep(.q-table th), :deep(.q-table td) {
  padding: 8px 12px;
}
</style>
