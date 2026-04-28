› Reloading apps
λ Bundling failed 1600ms node_modules\expo-router\node\render.js (1 module)
Web Bundling failed 1648ms node_modules\expo-router\entry.js (1 module)

Metro error: Unable to resolve module ./NotificationsEmitter from C:\Work\Antigravity\FamilyCart\node_modules\expo-notifications\build\index.js:

None of these files exist:
  * node_modules\expo-notifications\build\NotificationsEmitter(.web.ts|.ts|.web.tsx|.tsx|.web.js|.js|.web.jsx|.jsx|.web.json|.json|.web.cjs|.cjs|.web.mjs|.mjs|.web.scss|.scss|.web.sass|.sass|.web.css|.css|.web.css|.css)
  * node_modules\expo-notifications\build\NotificationsEmitter
  37 | export { default as unregisterTaskAsync } from './unregisterTaskAsync';
  38 | export * from './TokenEmitter';
> 39 | export * from './NotificationsEmitter';
     |                ^
  40 | export * from './NotificationsHandler';
  41 | export * from './NotificationPermissions';
  42 | export * from './NotificationChannelGroupManager.types';

Import stack:

 node_modules\expo-notifications\build\index.js
 | import "./NotificationsEmitter"

 app\(tabs)\profile.tsx
 | import "expo-notifications"

 app (require.context) 