'use strict'

const expect = require('chai').expect
let sinon = require('sinon')
let options = require('../src/options').options({})
let proxyquire = require('proxyquire')
let bluebird = require('bluebird')
let _ = require('lodash')
let mod
describe('consumer.js', () => {
  let consumer, mockAmqp, connection, channel, mockConnect
  beforeEach(() => {
    mockAmqp = sinon.stub({ connect: function () {} })
    mockConnect = {
      connect: sinon.stub({ open: function() {}, emit: () => {}, on: ()=> {} })
    }
    mod =  proxyquire('../src/consumer', {
      'amqplib': mockAmqp,
      './connect': mockConnect
    })
    connection = sinon.stub({ createChannel: function () {}, on: function () {}})
    channel = sinon.stub({ 
      on: function () {},
      assertQueue: function () {},
      bindQueue: function () {},
      consume: function () {},
      assertExchange:function () {},
      bindExchange:function () {}
    })
    channel.assertExchange.returns(bluebird.resolve())
    channel.bindExchange.returns(bluebird.resolve())
    connection.createChannel.returns(bluebird.resolve(channel))
    mockConnect.connect.open.returns(bluebird.resolve(bluebird.resolve(channel)))
    mockAmqp.connect.returns(bluebird.resolve(connection))
    consumer = mod.Consumer({})
  })
  

  describe('bind', () => {
    
    it('should assert the queue', (d) => {
      consumer.bind('abcd',() => {}).then(() => {
        expect(channel.bindExchange.calledOnce).to.equal(true)
        d()
      }).catch(d)
    })
    it('should bind the exchange with the passed in options arguments', (d) => {
      let ops = {}
      consumer.bind('abcd',() => {},ops).then(() => {
        expect(channel.bindExchange.args[0][3]).to.equal(ops)
        d()
      }).catch(d)
    })
    it('should bind the exchange with the passed in exchange uri', (d) => {
      options.exchange = 'topic://my-topic'
      consumer = mod.Consumer(options)
      consumer.bind('abcd',() => {}).then(() => {
        expect(channel.bindExchange.args[0][0]).to.equal('my-topic')
        d()
      }).catch(d)
    })
    it('should bind the queue with the correct arguments', (d) => {
      options.exchange = 'topic://my-topic'
      options.name = 'testqueue'
      consumer = mod.Consumer(options)
      consumer.bind('route',() => {}).then(() => {
        expect(channel.bindQueue.args[0]).to.deep.equal([ 'testqueue', 'my-topic', 'route' ])
        d()
      }).catch(d)
    })

  })
})