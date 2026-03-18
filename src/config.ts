/**
 * Global configuration loader for the TacticalRMM mobile application.
 * Uses Vite's environment variable system (VITE_ prefix required).
 */

export const config = {
  // Default API path segments to attempt during discovery
  apiPathSegments: (import.meta.env.VITE_API_PATH_SEGMENTS || '/api/v3/agents/,/agents/').split(','),
  
  // Optional fallback for MeshCentral if derivation fails
  meshCentralFallback: import.meta.env.VITE_MESH_CENTRAL_FALLBACK || '',
  
  // App-wide version (should match package.json)
  version: '3.1.10',
};

export default config;
