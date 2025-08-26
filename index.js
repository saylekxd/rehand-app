import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

console.log('🚀 Loading expo-router entry point...');

// Must be exported or Fast Refresh won't update the context
export function App() {
  console.log('🚀 ExpoRoot rendering...');
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
