const rfr = require('rfr')
const router = require('express').Router()
const controller = require('./controller')
const validators = require('./validators')
const jwtMiddleware = rfr('/helpers/jwt').middleware

// Create
router.post('/', [jwtMiddleware, validators.create, validators.uniqueCodeValidator], controller.create)

// Get
router.get('/', [jwtMiddleware], controller.findAndPaginate)

// Delete
router.delete('/:id', [jwtMiddleware], controller.remove)

module.exports = router
