import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It works both in Expo Go and in a native build, so Expo picks the correct
// root component for us and we do not have to write that boilerplate ourselves.
registerRootComponent(App);
