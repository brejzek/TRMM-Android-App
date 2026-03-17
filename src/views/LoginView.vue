<template>
  <q-page class="flex flex-center bg-slate-50">
    <div class="login-container">
      <div class="text-center q-mb-xl">
        <div class="text-h4 text-weight-bolder tracking-tight text-slate-900">
          Tactical<span class="text-primary">RMM</span>
        </div>
        <div class="text-subtitle1 text-slate-500 q-mt-sm">Command Center Mobile</div>
      </div>

      <q-card class="standard-card q-pa-lg" flat>
        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-y-md">
            <q-input
              v-model="apiUrl"
              label="API Endpoint"
              placeholder="https://api.yourdomain.com"
              stack-label
              outlined
              dense
              color="primary"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Required']"
            />

            <q-input
              v-model="apiKey"
              label="Access Token"
              placeholder="Your API Key"
              stack-label
              outlined
              dense
              color="primary"
              type="password"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Required']"
            />

            <div class="q-mt-lg">
              <q-btn
                label="Connect"
                type="submit"
                color="primary"
                unelevated
                class="full-width"
                style="border-radius: 8px; height: 44px;"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <div class="text-center q-mt-xl text-caption text-slate-400">
        v3.1.10 | Secure Terminal
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const apiUrl = ref('')
const apiKey = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    if (!apiUrl.value.startsWith('http')) {
      throw new Error('Invalid Endpoint URL')
    }
    auth.setCredentials(apiUrl.value, apiKey.value)
    $q.notify({
      message: 'Connected',
      color: 'primary',
      position: 'top',
      timeout: 1000
    })
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Connection Failure',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 90%;
  max-width: 380px;
}

.bg-slate-50 { background-color: #f8fafc; }
.text-slate-900 { color: #0f172a; }
.text-slate-500 { color: #64748b; }
.text-slate-400 { color: #94a3b8; }
</style>
