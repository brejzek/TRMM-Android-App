<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h5 text-primary text-weight-bold">TacticalRMM</div>
        <div class="text-caption text-grey-7">Enter your server details to connect</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="apiUrl"
            label="Server URL"
            placeholder="https://api.example.com"
            hint="The URL of your TacticalRMM API"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter your API URL']"
            filled
          >
            <template v-slot:prepend>
              <q-icon name="dns" />
            </template>
          </q-input>

          <q-input
            v-model="apiKey"
            label="API Key"
            placeholder="Your API Key"
            hint="Generate in Global Settings > API Keys"
            type="password"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter your API Key']"
            filled
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>

          <div class="q-mt-xl">
            <q-btn
              label="Connect"
              type="submit"
              color="primary"
              class="full-width"
              rounded
              unelevated
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center text-caption text-grey-6">
        This app is an unofficial client for TacticalRMM.
      </q-card-section>
    </q-card>
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
    // Basic URL validation
    if (!apiUrl.value.startsWith('http')) {
      throw new Error('URL must start with http:// or https://')
    }

    // Save credentials
    auth.setCredentials(apiUrl.value, apiKey.value)
    
    $q.notify({
      type: 'positive',
      message: 'Connected successfully!',
      position: 'top'
    })

    router.push({ name: 'dashboard' })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to connect',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border-radius: 12px;
}
</style>
