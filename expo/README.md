# SmartZ Expo Template

This folder contains a minimal Expo + React Native starter template **inside the monorepo** (`expo/`).

Quick start

1. From the `expo/` folder install dependencies:

```bash
cd expo
npm install
# or: pnpm install
```

2. Start the dev server:

```bash
npm run start
# or: npm run android
# or: npm run ios
# or: npm run web
```

Then open the project in the Expo Go app (scan the QR) or run in an emulator.

Notes

- The entry file is `App.tsx` — edit it to begin developing.
- If you want TypeScript types, `tsconfig.json` is provided.
- Example screen lives in `src/screens/HomeScreen.tsx`.

Local setup tips

- If you see a warning about `react-native-reanimated` when starting the web build, install the Expo-compatible version and add the Babel plugin:

	```bash
	cd expo
	npx expo install react-native-reanimated@~2.14.4
	```

- Make sure the app can reach the backend by setting your machine IP in `src/config/api.ts` (the default is a placeholder). Example:

	```ts
	export const API_BASE_URL = "http://10.110.178.144:3000/api"
	export const SOCKET_URL = "http://10.110.178.144:3000"
	```

	Replace the IP above with your local machine's IP (find it with `ip addr` / `hostname -I`).


If you'd like, I can also install the dependencies now and run a smoke test using Expo CLI — would you like me to do that? 🎯
