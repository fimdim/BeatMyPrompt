targetScope = 'resourceGroup'

@description('Name of the Static Web App')
param staticWebAppName string = 'beatmyprompt'

@description('Location for the Static Web App')
param location string = resourceGroup().location

@description('SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

@description('Tags for all resources')
param tags object = {
  app: 'BeatMyPrompt'
  environment: 'production'
}

module staticSite 'br/public:avm/res/web/static-site:0.7.0' = {
  name: 'staticSiteDeployment'
  params: {
    name: staticWebAppName
    location: location
    sku: sku
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    tags: tags
  }
}

@description('The default hostname of the Static Web App')
output defaultHostname string = staticSite.outputs.defaultHostname

@description('The resource ID of the Static Web App')
output staticWebAppId string = staticSite.outputs.resourceId

@description('The name of the Static Web App')
output staticWebAppName string = staticSite.outputs.name
