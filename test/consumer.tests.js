'use strict'

const expect = require('chai').expect
let sinon = require('sinon')
let options = require('../src/options').options
let proxyquire = require('proxyquire')
let bluebird = require('bluebird')
let _ = require('lodash')
describe('consumer.js', () => {
  let Consumer, mockAmqp
  beforeEach(() => {
    mockAmqp = sinon.stub({ connect: function () {} })
    let mod =  proxyquire('../src/consumer', {
      'amqplib': mockAmqp
    })
    Consumer = new mod.Consumer()
  })
  describe('bind', function() {
    let connection, channel
    beforeEach(() => {
      connection = sinon.stub({ createChannel: function () {}, on: function () {}})
      channel = { on: function() {} }
      connection.createChannel.returns(channel)
      mockAmqp.connect.returns(bluebird.resolve(connection))
    })

    it('should use the broker options',(d) => {
      Consumer.open().then(() =>{
        expect(mockAmqp.connect.args[0][0]).to.equal(options.broker)
        d()
      }).catch(d)
    })

    it('should create a channel', (d) => {
      Consumer.open().then(() => {
        expect(connection.createChannel.callCount).to.equal(1)
        d()
      }).catch(d)
    })

    it('should return the channel', (d) => {
      
      Consumer.open().then((r) => {
        expect(r).to.equal(channel)
        d()
      }).catch(d)
    })

  })

  describe('open', () => {
    
  })
})