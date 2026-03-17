<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="auth.isAuthenticated" class="glass-toolbar text-white">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="widgets"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="text-primary"
        />

        <q-toolbar-title class="text-weight-bold">
          <span class="text-primary">Tactical</span><span class="text-white">RMM</span>
        </q-toolbar-title>

        <q-btn flat round dense icon="account_circle" color="grey-4">
          <q-menu class="glass-card q-pa-sm" transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 150px">
              <q-item clickable v-vignette @click="logout" class="text-negative">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="auth.isAuthenticated"
      v-model="leftDrawerOpen"
      show-if-above
      behavior="mobile"
      class="bg-dark"
    >
      <div class="column full-height">
        <div class="q-pa-lg">
          <div class="text-h5 text-weight-bold text-primary">Management</div>
          <div class="text-caption text-grey-5">Control your fleet</div>
        </div>

        <q-list class="q-mt-md">
          <q-item clickable v-ripple to="/agents" active-class="text-primary glass-panel">
            <q-item-section avatar>
              <q-icon name="devices" />
            </q-item-section>
            <q-item-section>Agents</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/clients" active-class="text-primary glass-panel">
            <q-item-section avatar>
              <q-icon name="business" />
            </q-item-section>
            <q-item-section>Clients</q-item-section>
          </q-item>

          <q-item clickable v-ripple class="text-grey-6">
            <q-item-section avatar>
              <q-icon name="code" />
            </q-item-section>
            <q-item-section>Scripts</q-item-section>
            <q-item-section side>
              <q-badge label="Soon" color="primary" outline />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple class="text-grey-6">
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
            <q-item-section>WinGet</q-item-section>
          </q-item>

          <q-item clickable v-ripple class="text-grey-6">
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section>Chocolatey</q-item-section>
          </q-item>

          <q-item clickable v-ripple class="text-grey-6">
            <q-item-section avatar>
              <q-icon name="notifications" />
            </q-item-section>
            <q-item-section>Alerts</q-item-section>
          </q-item>

          <q-separator dark class="q-my-md opacity-1" />

          <q-item clickable v-ripple to="/login" class="text-negative">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md text-center">
          <div class="text-caption text-grey-7">v3.1.10</div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to disconnect from this server?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    auth.logout()
    router.push({ name: 'login' })
  })
}

onMounted(() => {
  // Check if we need to redirect on startup
  if (!auth.isAuthenticated && router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})
</script>

<style>
.q-page-container {
  background: #0F172A;
}

.opacity-2 {
  opacity: 0.2;
}

.opacity-50 { opacity: 0.5; }
.opacity-70 { opacity: 0.7; }
.opacity-80 { opacity: 0.8; }

.leading-tight {
  line-height: 1.1;
}

.border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.rounded-borders {
  border-radius: 12px;
}
</style>
