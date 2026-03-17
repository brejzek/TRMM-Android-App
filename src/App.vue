<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Clean Header -->
    <q-header v-if="auth.isAuthenticated" elevated class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <span class="text-primary">Tactical</span>RMM
        </q-toolbar-title>
        
        <q-btn flat round dense icon="account_circle" color="grey-7">
          <q-menu flat square class="border-subtle" transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 150px">
              <q-item clickable @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Disconnect</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Standard Bottom Navigation -->
    <q-footer v-if="auth.isAuthenticated" elevated class="bg-white text-grey-7">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="transparent"
        align="justify"
        @update:model-value="onTabChange"
      >
        <q-tab name="dashboard" icon="dashboard" label="Home" />
        <q-tab name="agents" icon="devices" label="Agents" />
        <q-tab name="clients" icon="business" label="Hub" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const tab = ref('dashboard')

watch(() => route.name, (val) => {
  if (val) tab.value = val as string
})

function onTabChange(name: string) {
  if (name === 'dashboard') router.push({ name: 'dashboard' })
  else if (name === 'agents') router.push({ name: 'agents' })
  else if (name === 'clients') router.push({ name: 'clients' })
}

function logout() {
  $q.dialog({
    title: 'Confirm',
    message: 'Exit secure session?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    auth.logout()
    router.push({ name: 'login' })
  })
}

onMounted(() => {
  if (!auth.isAuthenticated && route.name !== 'login') {
    router.push({ name: 'login' })
  }
})
</script>

<style>
.q-footer {
  border-top: 1px solid #e2e8f0;
}

.border-subtle {
  border: 1px solid #e2e8f0;
}
</style>
