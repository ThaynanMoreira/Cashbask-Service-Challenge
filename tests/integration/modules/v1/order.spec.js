const rfr = require('rfr')

const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

const app = rfr('tests/config/app')
const mongoose = require('mongoose')
const UserModel = mongoose.model('user')
const Model = mongoose.model('order')
const auth = rfr('tests/helpers/auth')(Model)

const ENDPOINT = '/api/v1/orders'

const testEntityValue = (entity, value) => {
  expect(entity).to.be.an('object')
  expect(entity).to.contain.all.keys(['_id', 'updated_at', 'created_at', 'date', 'status', 'code', 'price', 'cashbackValue', 'percentageCashback'])

  if (value && value.code) expect(entity.code).to.equal(value.code)
}

describe(ENDPOINT, () => {
  let authorizedUserToken, authorizedHeader, authorizedUser, initialOrder

  before(async () => {
    authorizedUser = await UserModel.create({username: 'test02', name: 'test', email: 'test02@test.com', password: 'test', personalDocument: '38202374230', active: true})
    authorizedUserToken = auth.getJWTFromUser(authorizedUser)
    authorizedHeader = {authorization: `Bearer ${authorizedUserToken}`}

    initialOrder = await Model.create({code: 'abcde123456', price: 120, personalDocument: '1234567890'})
  })

  after(async () => {
    UserModel.remove({username: 'test02'})
    Model.remove({code: 'abcde123456'})
  })

  describe('POST /', () => {
    it('should not accept unauthenticated request', async () => {
      const expectedMessage = {error: 'no_token'}
      const res = await request(app)
        .post(ENDPOINT)
        .send({ })

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.deep.equal(expectedMessage)
      expect(res.status).to.equal(401)
    })

    it('should validate required params', async () => {
      const expectedMessage = {
        code: {msg: {error: 'required'}},
        personalDocument: {msg: {error: 'required'}},
        price: {msg: {error: 'required'}}
      }

      const res = await request(app)
        .post(ENDPOINT)
        .set(authorizedHeader)
        .send({ })

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.shallowDeepEqual(expectedMessage)
      expect(res.status).to.equal(422)
    })

    it('should validate invalid params', async () => {
      const expectedMessage = {
        personalDocument: {msg: {error: 'length', max: 20, min: 10}}
      }
      const orderData = {code: 'abcde1234', price: '120', personalDocument: '12345'}

      const res = await request(app)
        .post(ENDPOINT)
        .set(authorizedHeader)
        .send(orderData)

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.shallowDeepEqual(expectedMessage)
      expect(res.status).to.equal(422)
    })

    it('should validate code uniqueness', async () => {
      const expectedMessage = {code: {msg: {error: 'unique'}}}
      const orderData = {code: initialOrder.code, price: '120', personalDocument: '1234567890'}

      const res = await request(app)
        .post(ENDPOINT)
        .set(authorizedHeader)
        .send(orderData)

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.shallowDeepEqual(expectedMessage)
      expect(res.status).to.equal(409)
    })

    it('should respond with success status and the created order when valid data is sent', async () => {
      const orderData = {code: 'qwerty123456', price: '350', personalDocument: '1234567890'}

      const res = await request(app)
        .post(ENDPOINT)
        .set(authorizedHeader)
        .send(orderData)

      expect(res.type).to.equal(`application/json`)
      testEntityValue(res.body, orderData)
      expect(res.status).to.equal(201)
    })

    it('should create a new record on DB when valid data is sent', async () => {
      const orderCount = await Model.find({}).count().exec()
      const orderData = {code: 'xyz123456', price: '600', personalDocument: '1234567890'}

      const res = await request(app)
        .post(ENDPOINT)
        .set(authorizedHeader)
        .send(orderData)

      const newOrderCount = await Model.find({}).count().exec()
      expect(newOrderCount).to.equal(orderCount + 1)
      const newOrderFind = await Model.find({code: res.code}).exec()
      expect(newOrderFind._id).to.equal(res._id)
    }).timeout(10000)
  })

  describe('GET /', () => {
    it('should not accept unauthenticated request', async () => {
      const expectedMessage = {error: 'no_token'}
      const res = await request(app)
        .get(ENDPOINT)
        .expect(401)

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.deep.equal(expectedMessage)
    })

    it('should respond with success status', async () => {
      const res = await request(app)
        .get(ENDPOINT)
        .set(authorizedHeader)
        .expect(200)

      expect(res.type).to.equal(`application/json`)
    })

    it('should return valid data', async () => {
      const res = await request(app)
        .get(ENDPOINT)
        .set(authorizedHeader)
        .expect(200)

      expect(res.type).to.equal(`application/json`)
      expect(res.body).to.contain.all.keys(['objects', 'meta'])
      expect(res.body.meta).to.be.an('object')
      expect(res.body.meta).to.contain.all.keys(['currentPage', 'limit', 'totalPages', 'count'])
      expect(res.body.objects).to.be.an('array')
      res.body.objects.every(u => {
        expect(u).to.be.an('object')
        expect(u).to.contain.all.keys(['_id', 'updated_at', 'created_at', 'date', 'status', 'code', 'price', 'cashbackValue', 'percentageCashback'])
        return true
      })
    })
  })

  describe('DELETE /:id', () => {
    it('should not accept unauthenticated request', async () => {
      const expectedMessage = {error: 'no_token'}
      const res = await request(app)
        .delete(`${ENDPOINT}/${initialOrder._id}`, {})
        .expect(401)

      expect(res.body).to.deep.equal(expectedMessage)
    })

    it('should respond a 404 when not found', async () => {
      const res = await request(app)
        .delete(`${ENDPOINT}/585359000214ed0c00000000`)
        .set(authorizedHeader)
        .expect(404)

      expect(res.status).to.equal(404)
    })

    it('should respond with success status and the created order when valid data is sent', async () => {
      const toDeleteOrder = await Model.create({code: 'qwertxyz123456', price: '1800', personalDocument: '1234567890'})
      const res = await request(app)
        .delete(`${ENDPOINT}/${toDeleteOrder._id}`)
        .set(authorizedHeader)
        .expect(204)

      expect(res.status).to.equal(204)
    })

    it('should remove the matching record on DB when authorized request', async () => {
      const toDeleteOrder = await Model.create({code: 'qwertxyz123456', price: '1800', personalDocument: '1234567890'})
      await request(app)
        .delete(`${ENDPOINT}/${toDeleteOrder._id}`)
        .set(authorizedHeader)
        .expect(204)

      const queryingOrder = await Model.find({_id: toDeleteOrder._id}).count()
      expect(queryingOrder).to.equal(0)
    })
  })
})
