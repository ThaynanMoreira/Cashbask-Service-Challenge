const rfr = require('rfr')
const actionsPath = './actions/'
const Model = require('./model').model
const extend = require('extend')
const request = require('request')
const createQueryObject = rfr('helpers/request').createQueryObject
const jwtHelper = rfr('helpers/jwt')
const fs = require('fs')
const path = require('path')

const controllerActions = {}

// Import default actions
const importActions = ['findById', 'findOneAndUpdate', 'update', 'remove', 'checkExists']
const createMethodsFromActions = (element, index) => {
  controllerActions[element] = rfr(actionsPath + element)(Model)
}
importActions.forEach(createMethodsFromActions)

// Controller custom actions
const customMethods = {
  find: (req, res) => {
    let query = createQueryObject(req)

    if (req.query.filter && req.query.filter.length) {
      let regex = new RegExp(req.query.filter, 'i')
      query = Object.assign(query, {
        '$or': [
          { name: regex },
          { username: regex },
          { email: regex }
        ]
      })
    }

    const pagOptions = {
      page: (Number.parseInt(req.query.page) - 1) || 0,
      limit: Number.parseInt(req.query.limit) || 15,
      sort: req.query.sort || { 'name': 'asc' }
    }

    Model
      .find(query)
      .count()
      .exec((err, count) => {
        if (err) throw err
        const meta = {
          currentPage: (pagOptions.page + 1),
          limit: pagOptions.limit,
          totalPages: Math.ceil(count / pagOptions.limit),
          count: count
        }
        Model
          .find(query)
          .sort(pagOptions.sort)
          .skip(pagOptions.page * pagOptions.limit)
          .limit(pagOptions.limit)
          .exec((err, data) => {
            if (err) throw err
            const response = {
              users: data,
              meta: meta
            }
            res.status(200).json(response)
          })
      })
  },
  getCashbackAmount: async (req, res) => {
    try {
      const user = await Model.findById(jwtHelper.getUserId(req))

      if (!user) return res.status(404).json()
      if (!user.active) return res.status(403).json({ error: 'user_inactive' })

      const options = {
        method: 'GET',
        url: process.env.CASHBACK_API_URL,
        qs: { cpf: user.personalDocument }
      }

      request(options, function (error, response, body) {
        if (error) throw new Error(error)

        const jsonBody = JSON.parse(body)
        if (response.statusCode !== 200 || !jsonBody.body || !jsonBody.body.credit) {
          return res.status(500).json('Cashback API is Down')
        }
        res.status(200).json(jsonBody.body)
      })
    } catch (error) {
      throw error
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body
      const userModel = new Model(data)

      userModel.passwordToken = Math.random().toString(35).substr(2, 20).toUpperCase()
      const user = await userModel.save()

      const urlsPath = path.join(global._base, '/tmp/activated_logins/', 'activated_login_url.txt')
      require('fs-extra').ensureFileSync(urlsPath)
      fs.appendFileSync(urlsPath, `\nhttp://${process.env.ACTIVATED_URL}/${user.passwordToken}`)

      const jsonUser = user.toJSON()
      delete jsonUser.passwordToken
      delete jsonUser.password

      res.status(201).json(jsonUser)
    } catch (error) {
      throw error
    }
  }
}

extend(controllerActions, customMethods)
module.exports = controllerActions
