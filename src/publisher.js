import {getLogger} from './logger'
import {options} from './options'
import * as url from 'url'
import {_} from 'lodash'
import * as util from 'util'
import {Consumer} from './consumer.js'
import * as shortid from 'shortid'
import {AmqpMessage} from './AmqpMessage'

const P = require('bluebird')
const amqp = require('amqplib')
const connect = require('./connect').connect
const publisher = {
  bindResponseConsumer: function bind(queue) {
    return this.open()
      .then((channel) => {
        return channel.assertExchange(this.exchangeUri.host, this.exchangeUri.protocol.replace(':',''), { autoDelete: false, durable: false })
          .then(function() {
            return channel
          })
      })
      .tap(() => this.log.verbose('exhange asserted', this.exchangeUri.host))
      .then((ch) => {
        this.channel = ch
        queue = queue + '.#'
        this.log.info('binding publisher reply consumer ', this.exchangeUri.host, this.exchangeUri.host, queue, this.options )
        return ch.bindExchange(this.exchangeUri.host, this.exchangeUri.host, queue, { durable: false, autoDelete: false })
          .tap(() => this.log.info('queue asserted'))
          .then(() => ch.assertQueue(queue, { durable: false, autoDelete: true }) )
          .then(() => ch.bindQueue(queue, this.exchangeUri.host, queue) )
          .then(() => ch.consume(queue, this.handler.bind(this),{ noAck: true }))
      })
  },
  getReply: function(val,routeKey) {
    return this.send(val, routeKey, util.format('%s/%s.reply.%d/%s',this.options.exchange,this.responseQueue,++this.count,this.responseQueue))
  },
  send: function publish(val, routeKey, replyTo, headers) {
    this.log.info('sending with routekey',replyTo);
    const message = new Buffer(JSON.stringify(val));
    this.log.verbose('publisher.send:', this.exchangeUri.host, message)
    const properties = Object.assign({ contentType: 'application/json', replyTo: replyTo}, headers)
    this.log.silly('publisher.sending with',this.exchangeUri.host, routeKey, message, properties)
    this.channel.publish(this.exchangeUri.host, routeKey, message, properties)
    if(replyTo) {
      return new P((resolve) => {
        this.queue[Symbol.for('rq' + this.count.toString())] = resolve;
      }).timeout(5000)
    }
  },
  handler: function handler(msg) {
    const parsed = new AmqpMessage(msg)
    const msgId = _.last(parsed.routingKey.split('.'))
    this.queue[Symbol.for('rq' + msgId)](parsed);
  }
}

Object.assign(publisher,connect)

function Publisher(ops) {
  ops = options(ops)
  publisher.options = ops;

  const responseQueue = util.format('%s.%s',ops.name,shortid.generate())
  const _pub = {
    exchangeUri: url.parse(ops.exchange),
    responseQueue: responseQueue,
    count: 0
  };
  Object.assign(publisher,_pub)
  publisher.log = getLogger(ops.name + ':badger:publisher')
  publisher.log.verbose('publisher.options',publisher.options)
  return publisher.open(options)
    .then(() => publisher.bindResponseConsumer(responseQueue))
    .then(() => publisher)
}

export {Publisher}

