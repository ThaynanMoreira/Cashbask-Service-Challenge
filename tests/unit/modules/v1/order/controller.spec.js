const rfr = require('rfr')
const chai = require('chai')
const expect = chai.expect

const controller = rfr('./modules/v1/order/controller')

describe('Module order: Controller', () => {
  it('should have all routes required methods registred', () => {
    expect(controller).to.contain.all.keys(['create', 'findAndPaginate', 'remove'])
  })
})
