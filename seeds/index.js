require('dotenv').config()
const rfr = require('rfr')
const seeder = require('./seeder')

const chalk = require('chalk')
const error = chalk.bold.red
const success = chalk.bold.green
const info = chalk.bold.blue

const seedUsers = () => {
  console.log(info('\n**** Seeding Users... ****\n'))
  const model = rfr('modules/v1/user/model').model
  const data = require('./user')

  return seeder.clearAndSeed(model, data)
}

const seedOrders = () => {
  console.log(info('\n**** Seeding Orders... ****\n'))
  const model = rfr('modules/v1/order/model').model
  const data = require('./order')

  return seeder.clearAndSeed(model, data)
}

const execute = () => {
  const funcs = [seedOrders(), seedUsers()]
  return Promise.all(funcs)
}

seeder.connect().then(() => {
  console.log(success('**** DB connected sucessfully **** \n'))
  execute()
    .then(response => {
      let count = 0
      response.forEach(() => count++)
      console.log(success(`\n ### All Seeds done!  ### \n`))
      console.log(success(`\n ### ${count} seeds ran!  ### \n`))
      process.exit(0)
    })
    .catch(err => {
      console.log(error(err))
      process.exit(1)
    })
}).catch((err) => {
  console.log(error(err))
  process.exit(1)
})
