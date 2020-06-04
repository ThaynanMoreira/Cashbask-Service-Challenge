const rfr = require('rfr')
const actionsPath = './actions/'
const Model = require('./model').model
const extend = require('extend')

const controllerActions = {}

// Import default actions
const importActions = ['create', 'findAndPaginate', 'remove']
const createMethodsFromActions = (element, index) => {
  controllerActions[element] = rfr(actionsPath + element)(Model)
}
importActions.forEach(createMethodsFromActions)

// Controller custom actions
const customMethods = {}

extend(controllerActions, customMethods)
module.exports = controllerActions
