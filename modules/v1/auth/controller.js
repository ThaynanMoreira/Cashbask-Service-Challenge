const rfr = require('rfr')
const actionsPath = './actions/'
const Model = require('../user/model').model
const extend = require('extend')
const jwtHelper = rfr('helpers/jwt')

const controllerActions = {}

// Import default actions
const importActions = []
const createMethodsFromActions = (element, index) => {
  controllerActions[element] = rfr(actionsPath + element)(Model)
}
importActions.forEach(createMethodsFromActions)

// Controller custom actions
const customMethods = {
  fetch: (req, res) => {
    Model
      .findById(jwtHelper.getUserId(req), (err, data) => {
        if (err) throw err

        if (!data) return res.status(404).json()
        if (!data.active) return res.status(403).json({error: 'user_inactive'})

        res.json(data)
      })
  },
  authenticate: (req, res) => {
    const query = {$or: [{username: req.body.username}, {email: req.body.username}]}
    Model.findOne(query)
      .select('+password')
      .exec((err, user) => {
        if (err) throw err

        if (!user) {
          return res.status(404).json({error: 'user_not_found'})
        } else if (!user.active) {
          return res.status(403).json({error: 'user_inactive'})
        } else {
          user.verifyPassword(req.body.password, (err, valid) => {
            if (err) throw err

            if (!valid) {
              return res.status(422).json({error: 'wrong_credentials'})
            } else {
              return res.status(200).json({token: jwtHelper.generateToken(user)})
            }
          })
        }
      })
  },
  activateLogin: (req, res) => {
    const query = {passwordToken: req.params.token}
    Model
      .findOne(query, (err, user) => {
        if (err) throw err

        if (!user) {
          res.status(404).json({error: 'user_not_found'})
        } else {
          user['passwordToken'] = undefined
          user['active'] = true
          user.save((error) => {
            if (error) throw error

            res.status(204).json()
          })
        }
      })
  }
}

extend(controllerActions, customMethods)
module.exports = controllerActions
