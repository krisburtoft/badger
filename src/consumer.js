import {getLogger} from './logger'
import {options} from './options'
import * as url from 'url'
import {_} from 'lodash'
import * as util from 'util'
import {AmqpMessage} from './AmqpMessage'

const connect = require('./connect').connect
const amqp = require('amqplib')
const log = getLogger(options.name + ':consumer')
const consumer = {
  bind: function bind(routeKey, handler, ops) {
    return this.open()
      .then((channel) => {
        return channel.assertExchange(this.exchangeUri.host, this.exchangeUri.protocol.replace(':',''), ops || { autoDelete: false, durable: false })
          .then(function() {
            return channel
          })
      })
      .tap(() => log.verbose('exhange asserted', this.exchangeUri.host))
      .then((ch) => {
        this.channel = ch
        log.info('binding consumer to routeKey', routeKey)
        return ch.bindExchange(this.exchangeUri.host, this.exchangeUri.host, routeKey, ops || { durable: false, autoDelete: false })
          .then(() => ch.assertQueue(this.queue,{durable:false, autoDelete: true}) )
          .then(() => ch.bindQueue(this.queue, this.exchangeUri.host, routeKey) )
          .then(() => ch.consume(this.queue, (msg) => {
            const message = new AmqpMessage(msg)
            const val = handler && handler(message)
            if(!val) {
              log.warn('no response from handler',val);
              return;
            }
            return val.then ? val.then((r) => this.publish(r,message)) : this.publish(val,message)
          },{ noAck: true }))
      })
      .tap(() => this.emit('ready'))
  },

  publish: function publish(val, msg) {
    if(!msg.replyTo && val){
      log.warn('publish| no replyTo for message')
      return
    }

    if(msg.replyTo && !val) {
      log.warn('no response body for message replyTo', msg.replyTo)
      log.warn('setting default response for message {}')
      val = {}
    }
    const message = new Buffer(JSON.stringify(val));
    log.verbose('handler reply',this.exchangeUri.host, msg.replyTo, val)
    this.channel.publish(this.exchangeUri.host, msg.replyTo, message, { contentType: 'application/json'})
  }
}

Object.assign(consumer,connect)

function Consumer(ops) {
  ops = options(ops)
  const queue = ops.name;
  const exchangeUri = url.parse(ops.exchange)
  var cons = {
    queue: ops.name,
    exchangeUri: url.parse(ops.exchange),
    options: ops
  }
  Object.assign(cons,consumer)
  return cons
}

export {Consumer}

