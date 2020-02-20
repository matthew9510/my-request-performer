var serverlessSDK = require('./serverless_sdk/index.js')
serverlessSDK = new serverlessSDK({
orgId: 'softstack',
applicationName: 'my-request',
appUid: '4XFJd9Nhtp2DRxvs4x',
orgUid: 'XWwwFN8qv8wVdD5yvZ',
deploymentUid: 'bc47483d-fb42-499a-a72e-24ba4b8e2b3a',
serviceName: 'requests',
stageName: 'dev',
pluginVersion: '3.3.0'})
const handlerWrapperArgs = { functionName: 'my-request-requests', timeout: 6}
try {
  const userHandler = require('./src/index.js')
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs)
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs)
}
