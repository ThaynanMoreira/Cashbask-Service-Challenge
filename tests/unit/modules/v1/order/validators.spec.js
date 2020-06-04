const rfr = require('rfr')
const chai = require('chai')
const expect = chai.expect

const request = rfr('./tests/helpers/request')
const validators = rfr('./modules/v1/order/validators')

describe('Module Order: Validators', () => {
  let req
  let checkBody
  let notEmpty
  let len
  let isNumeric
  let getValidationResult

  beforeEach(() => {
    req = request.stubReq()
    checkBody = request.stubCheckBody(req)
    notEmpty = request.stubNotEmpty(req)
    len = request.stubLen(req)
    isNumeric = request.stubIsNumeric(req)
    getValidationResult = request.stubGetValidationResult(req)
  })

  afterEach(() => {
    checkBody.restore()
    notEmpty.restore()
    len.restore()
    isNumeric.restore()
    getValidationResult.restore()
  })

  it('should have all the required methods registred', () => {
    expect(validators).to.contain.all.keys(['create', 'uniqueCodeValidator'])
  })

  describe('Method Create', () => {
    beforeEach(() => {
      validators.create(req, request.res, () => {})
    })
    it('should be a function', () => {
      expect(validators.create).to.be.a('function')
    })
    it('should call checkBody 6 times', () => {
      expect(checkBody.called).to.equal(true)
      expect(checkBody.callCount).to.equal(6)
    })
    it('should call len 1 times', () => {
      expect(len.called).to.equal(true)
      expect(len.callCount).to.equal(1)
    })
    it('should call notEmpty 3 times', () => {
      expect(notEmpty.called).to.equal(true)
      expect(notEmpty.callCount).to.equal(3)
    })
    it('should call isNumeric 2 times', () => {
      expect(isNumeric.called).to.equal(true)
      expect(isNumeric.callCount).to.equal(2)
    })
    it('should verify code required', () => {
      expect(checkBody.calledWith('code', {error: 'required'})).to.equal(true)
    })
    it('should verify personalDocument length', () => {
      expect(checkBody.calledWith('personalDocument', {error: 'length', min: 10, max: 20})).to.equal(true)
    })
    it('should verify personalDocument required', () => {
      expect(checkBody.calledWith('personalDocument', {error: 'required'})).to.equal(true)
    })
    it('should verify personalDocument is numeric', () => {
      expect(checkBody.calledWith('personalDocument', {error: 'isNumeric'})).to.equal(true)
    })
    it('should verify price required', () => {
      expect(checkBody.calledWith('price', {error: 'required'})).to.equal(true)
    })
    it('should verify price is numeric', () => {
      expect(checkBody.calledWith('personalDocument', {error: 'isNumeric'})).to.equal(true)
    })
  })
})
