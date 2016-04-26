const expect = require('chai').expect
let sinon = require('sinon')
let options = require('../src/options').options
let proxyquire = require('proxyquire')
let bluebird = require('bluebird')
describe('connect', () => {
  let connect,connection,mockAmqp,channel,mockConnect
  beforeEach(() => {
    mockAmqp = sinon.stub({ connect: function () {} })
    mockConnect = {
      connect: sinon.stub({ open: function() {}, emit: () => {}, on: ()=> {} })
    }
    connect =  proxyquire('../src/connect', {
      'amqplib': mockAmqp,
    }).connect
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
    connect.options = {}
    mockConnect.connect.open.returns(bluebird.resolve(bluebird.resolve(channel)))
    mockAmqp.connect.returns(bluebird.resolve(connection))
  })
  describe('open', () => {
    
    it('should create a channel', (d) => {
      connect.open().then(() => {
        expect(connection.createChannel.callCount).to.equal(1)
        d()
      }).catch(d)
    })

    it('should return the channel', (d) => {
      connect.open().then((r) => {
        expect(r).to.equal(channel)
        d()
      }).catch(d)
    })

    it('should use the correct broker', (d) => {
      connect.options = {
        broker: 'amqp://user:password@mybroker'
      }
      connect.open().then(() => {
        expect(mockAmqp.connect.args[0][0]).to.equal(connect.options.broker)
        d()
      }).catch(d)
    })
  })
})
