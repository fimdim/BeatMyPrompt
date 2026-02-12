using './main.bicep'

param staticWebAppName = 'beatmyprompt'
param sku = 'Free'
param tags = {
  app: 'BeatMyPrompt'
  environment: 'production'
}
