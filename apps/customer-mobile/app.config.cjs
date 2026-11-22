const appJson = require('./app.base.json')

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1'
const isProductionBuild = process.env.EAS_BUILD_PROFILE === 'production'
const usesCleartextApi = !isProductionBuild && apiBaseUrl.startsWith('http://')

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    usesCleartextTraffic: usesCleartextApi,
  },
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      ...appJson.expo.ios?.infoPlist,
      ...(usesCleartextApi ? { NSAppTransportSecurity: { NSAllowsArbitraryLoads: true } } : {}),
    },
  },
}
