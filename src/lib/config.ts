export const config = {
  scoring: { minScoreCompraForte:80, minScoreCompraMod:65, minScoreAguardar:45 },
  plans: {
    FREE:    {maxAssets:10,  maxAlerts:5,   maxAiDaily:3,   cacheSeconds:300, backtestDays:30},
    PRO:     {maxAssets:30,  maxAlerts:50,  maxAiDaily:50,  cacheSeconds:60,  backtestDays:365},
    PREMIUM: {maxAssets:100, maxAlerts:999, maxAiDaily:999, cacheSeconds:30,  backtestDays:730},
  },
  cache: {defaultTtl:300},
  brapi: {baseUrl:'https://brapi.dev/api', token:process.env.BRAPI_TOKEN||''},
};
export default config;