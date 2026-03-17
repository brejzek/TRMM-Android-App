<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-lg">
      <div class="row items-center">
        <div class="column">
          <div class="text-h5 text-weight-bold tracking-tight text-slate-900 leading-tight">Infrastructure Hub</div>
          <div class="text-caption text-slate-500 q-mt-xs">Manage sites and organizations</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" color="grey-6" :loading="loading" @click="fetchData" />
      </div>

      <q-input
        v-model="search"
        placeholder="Filter clients or sites..."
        dense
        outlined
        bg-color="white"
        class="standard-card"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>

      <div class="column q-gutter-y-md">
        <q-card v-for="client in filteredGroups" :key="client.name" class="standard-card overflow-hidden" flat>
          <q-expansion-item
            header-class="q-pa-md text-weight-bold"
            expand-icon-class="text-grey-7"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="business" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ client.name }}</q-item-label>
                <q-item-label caption>{{ client.sites.length }} Sites</q-item-label>
              </q-item-section>
            </template>

            <q-separator />
            
            <q-list padding>
              <q-item v-for="site in client.sites" :key="site.name" clickable v-ripple @click="viewAgents(client, site)">
                <q-item-section avatar>
                  <q-icon name="place" color="grey-6" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ site.name }}</q-item-label>
                  <q-item-label caption>{{ site.agents?.length || 0 }} Agents</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-4" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore } from '../stores/agents'

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

function fetchData() {
  agentStore.fetchAgents()
}

function viewAgents(client: any, site: any) {
  router.push({ name: 'agents', query: { client: client.id, site: site.id } })
}

onMounted(() => {
  if (groups.value.length === 0) fetchData()
})
</script>

<style scoped>
.leading-tight { line-height: 1.25; }
</style>
