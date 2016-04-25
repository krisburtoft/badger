const amqp = require('amqplib')
import {getLogger} from './logger'
import {options} from './options'
import * as url from 'url'
import {_} from 'lodash'
import EventEmitter from 'events'
import * as util from 'util'
let log = getLogger(options.name)

export function Consumer(ops) {
  _.assign(options, ops || {})
  const queue = options.name;
  const exchangeUri = url.parse(options.exchange)
  let consumer = {
    bind: function bind(routeKey, handler, ops) {
      return this.open()
        .then((channel) => {
          return channel.assertExchange(exchangeUri.host, exchangeUri.protocol.replace(':',''), ops || { autoDelete: false, durable: false })
            .then(function() {
              return channel
            })
        })
        .tap(() => log.verbose('exhange asserted', exchangeUri.host))
        .then((ch) => {
          this.channel = ch
          log.info('binding consumer to routeKey', routeKey)
          return ch.bindExchange(exchangeUri.host, exchangeUri.host, routeKey, ops || { durable: false, autoDelete: false })
            .then(() => ch.assertQueue(queue) )
            .then(() => ch.bindQueue(queue, exchangeUri.host, routeKey) )
            .then(() => ch.consume(queue, (msg) => {
              const message = new AmqpMessage(msg)
              const val = handler(message)
              return val && val.then ? val.then((r) => this.publish(r,message)) : this.publish(val,message)
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
      log.verbose('handler reply',exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)))
      this.channel.publish(exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)), { contentType: 'application/json'})
    },
    open: function open(ops) {
      return amqp.connect(options.broker)
        .tap((conn) => {
          log.verbose('connection open')
          conn.on('error',(arg) => this.emit('error',arg))
        })
        .then((conn) => conn.createChannel())
        .tap((channel) => {
          channel.on('error',(arg) => this.emit('error',arg))
        })
        .catch((err) => {
          log.error('amqp connection error', options.broker, err)

        })
    }
  }
  Object.assign(consumer, EventEmitter.prototype)
  return consumer
}


class AmqpMessage {
  constructor(msg) {
    this.msg = msg
    log = getLogger('AmqpMessage')
    log.verbose(JSON.stringify(msg,null,4))
    this.replyTo = url.parse(msg.properties.replyTo).path.split('/')[1]
  }
  get body() {
    let body = this.msg.content.toString('utf8')
    log.verbose('msg content', body)
    return JSON.parse(body)
  }
}

export {Consumer}

