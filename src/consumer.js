import * as amqp from 'amqplib';
import {Logger} from './logger';
import {options} from './options';
import * as url from 'url';
class Consumer {
  constructor(queue, handler) {
    this.queue = queue;
    this.log = new Logger(queue);
    this.exchangeUri = url.parse(options.exchange);
  }

  bind(routeKey, ops) {
    return this.open()
      .then((channel) => {
        return channel.assertExchange(this.exchangeUri.host, this.exchangeUri.protocol.replace(':',''), ops || { autoDelete: false, durable: false })
          .then(function() {
            return channel;
          });
      })
      .tap(() => this.log.verbose('exhange asserted', this.exchangeUri.host))
      .then((ch) => {
        this.channel = ch;
        this.log.info('binding consumer to routeKey', routeKey);
        return ch.bindExchange(this.exchangeUri.host, this.exchangeUri.host, routeKey, ops || { durable: false, mandatory: true })
          .then(() => ch.assertQueue(this.queue) )
          .then(() => ch.bindQueue(this.queue, this.exchangeUri.host, routeKey) )
          .then(() => ch.consume(this.queue, (msg) => {
            const message = new AmqpMessage(msg);
            const val = handler(message);
            return val && val.then ? val.then((r) => this.publish(r,message)) : this.publish(val,message);
          },{ noAck: true }));
      });
  }

  publish(val, msg) {
    if(!msg.replyTo && val){
      this.log.warn('publish| no replyTo for message');
      return;
    }

    if(msg.replyTo && !val) {
      this.log.warn('no response body for message replyTo', msg.replyTo);
      this.log.warn('setting default response for message {}');
      val = {};
    }
    this.log.verbose('handler reply',this.exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)));
    this.channel.publish(this.exchangeUri.host, msg.replyTo, new Buffer(JSON.stringify(val)), { contentType: 'application/json'});
  }

  open(ops) {
    return amqp.connect(options.broker)
      .tap((conn) => this.log.verbose('connection open'))
      .then((conn) => conn.createChannel())
      .catch((err) => {
        this.log.error('amqp connection error', options.broker, err);
      });
  }

}


class AmqpMessage {
  constructor(msg) {
    this.msg = msg;
    this.log = new Logger('AmqpMessage');
    this.log.verbose(JSON.stringify(msg,null,4));
    this.replyTo = url.parse(msg.properties.replyTo).path.split('/')[1];
  }
  get body() {
    let body = this.msg.content.toString('utf8');
    this.log.verbose('msg content', body);
    return JSON.parse(body);
  }
}

var cons = new Consumer('consumer');
cons.bind('abcd').then(function() {
  new Logger('test').info('connection good');
});

function handler(msg) {
  new Logger('handler').info('msg',msg.body);
  return msg.body;
}


