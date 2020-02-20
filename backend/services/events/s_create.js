var serverlessSDK = require('./serverless_sdk/index.js')
serverlessSDK = new serverlessSDK({
orgId: 'softstack',
applicationName: 'my-request',
appUid: '4XFJd9Nhtp2DRxvs4x',
orgUid: 'XWwwFN8qv8wVdD5yvZ',
deploymentUid: '98a6eff5-a85d-4656-8f65-b319cdf382e8',
serviceName: 'my-request-events-api',
stageName: 'dev',
pluginVersion: '3.3.0'})
const handlerWrapperArgs = { functionName: 'my-request-events-api-dev-create', timeout: 6}
try {
  const userHandler = require('./src/index.js')
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs)
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs)
}
