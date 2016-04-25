'use strict'

const expect = require('chai').expect
let sinon = require('sinon')
let options = require('../src/options').options
let proxyquire = require('proxyquire')
let bluebird = require('bluebird')
let _ = require('lodash')
let mod
describe('consumer.js', () => {
  let consumer, mockAmqp, connection, channel
  beforeEach(() => {
    mockAmqp = sinon.stub({ connect: function () {} })
    mod =  proxyquire('../src/consumer', {
      'amqplib': mockAmqp
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
    mockAmqp.connect.returns(bluebird.resolve(connection))
    consumer = mod.Consumer({})
  })
  describe('open', () => {
    it('should use the broker options',(d) => {
      consumer.open().then(() =>{
        expect(mockAmqp.connect.args[0][0]).to.equal(options.broker)
        d()
      }).catch(d)
    })

    it('should create a channel', (d) => {
      consumer.open().then(() => {
        expect(connection.createChannel.callCount).to.equal(1)
        d()
      }).catch(d)
    })

    it('should return the channel', (d) => {
      consumer.open().then((r) => {
        expect(r).to.equal(channel)
        d()
      }).catch(d)
    })

    it('should use the correct broker', (d) => {
      let ops = {
        broker: 'amqp://user:password@mybroker'
      }
      consumer = new mod.Consumer(ops)
      consumer.open().then(() => {
        expect(mockAmqp.connect.args[0][0]).to.equal(ops.broker)
        d()
      }).catch(d)
    })
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