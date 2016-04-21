const amqp = require('amqplib')
import {Logger} from './logger'
import {options} from './options'
import * as url from 'url'
let EventEmitter = require('events')
import * as util from 'util'
class Consumer extends EventEmitter {
  constructor(queue, handler) {
    super()
    this.queue = queue
    this.log = new Logger(queue)
    this.exchangeUri = url.parse(options.exchange)
  }

  bind(routeKey, ops) {
    return this.open()
      .then((channel) => {
        return channel.assertExchange(this.exchangeUri.host, this.exchangeUri.protocol.replace(':',''), ops || { autoDelete: false, durable: false })
          .then(function() {
            return channel
          })
      })
      .tap(() => this.log.verbose('exhange asserted', this.exchangeUri.host))
      .then((ch) => {
        this.channel = ch
        this.log.info('binding consumer to routeKey', routeKey)
        return ch.bindExchange(this.exchangeUri.host, this.exchangeUri.host, routeKey, ops || { durable: false, mandatory: true })
          .then(() => ch.assertQueue(this.queue) )
          .then(() => ch.bindQueue(this.queue, this.exchangeUri.host, routeKey) )
          .then(() => ch.consume(this.queue, (msg) => {
            const message = new AmqpMessage(msg)
            const val = handler(message)
            return val && val.then ? val.then((r) => this.publish(r,message)) : this.publish(val,message)
          },{ noAck: true }))
      })
      .tap(() => this.emit('ready'))
  }

  publish(val, msg) {
    if(!msg.replyTo && val){
      this.log.warn('publish| no replyTo for message')
      return
    }

    if(msg.replyTo && !val) {
      this.log.warn('no response body for message replyTo', msg.replyTo)
      this.log.warn('setting default response for message {}')
      val = {}
    }
    this.log.verbose('handler reply',this.exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)))
    this.channel.publish(this.exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)), { contentType: 'application/json'})
  }
  onError(err) {
    this.emit('error', err)
  }
  open(ops) {
    return amqp.connect(options.broker)
      .tap((conn) => {
        this.log.verbose('connection open')
        conn.on('error',this.onError)
      })
      .then((conn) => conn.createChannel())
      .tap((channel) => {
        channel.on('error',this.onError)
      })
      .catch((err) => {
        this.log.error('amqp connection error', options.broker, err)

      })
  }

}


class AmqpMessage {
  constructor(msg) {
    this.msg = msg
    this.log = new Logger('AmqpMessage')
    this.log.verbose(JSON.stringify(msg,null,4))
    this.replyTo = url.parse(msg.properties.replyTo).path.split('/')[1]
  }
  get body() {
    let body = this.msg.content.toString('utf8')
    this.log.verbose('msg content', body)
    return JSON.parse(body)
  }
}

export {Consumer}
