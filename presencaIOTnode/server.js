const aws = require('aws-sdk')
const restify = require('restify')
const HttpStatus = require('http-status-codes')
const server = restify.createServer()

const request = require("request-promise");

server.getDebugInfo();

aws.config
  .loadFromPath('./config/config.json')

server
  .use(restify.plugins.bodyParser({ mapParams: true }))
  .use(restify.plugins.queryParser({ mapParams: true }))
  .use(restify.plugins.acceptParser(server.acceptable))

let array = []
const env = require('./config/environments')
const snsInit = new aws.SNS({ apiVersion: '2010-03-31' })
const params = { Protocol: 'sms' }

// Controllers
const listarTopicos = (req, res, next) => {
  array = []
  const listar = snsInit
    .listTopics({})
    .promise()

  listar
    .then(data => {
      data.Topics.forEach(element => {
        array.push({
          ARN: element.TopicArn,
          Name: element.TopicArn.split(':').pop(),
        })
      })

      res.send(HttpStatus.OK, array)
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const criarTopico = (req, res, next) => {
  const criar = snsInit
    .createTopic({ Name: req.body.name })
    .promise()

  criar
    .then(data => {
      res.send(HttpStatus.CREATED, {
        ARN: data.TopicArn,
        Name: data.TopicArn.split(':').pop(),
      })
    })
    .catch(data => {
      console.error(`${error.stack}`)
    })
}

const deletarTopico = (req, res, next) => {
  const deletar = snsInit
    .deleteTopic({ TopicArn: req.params.arn })
    .promise()

  deletar
    .then(data => {
      res.send(HttpStatus.OK, { mensagem: 'Tópico deletado com sucesso.' })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const meAdicionarNaLista = (req, res, next) => {
  Object.assign(params, {
    TopicArn: req.body.topicARN,
    Endpoint: req.body.endpoint
  })

  const adicionar = snsInit
    .subscribe(params)
    .promise()

  adicionar
    .then(data => {
      res.send(HttpStatus.CREATED, {
        subscriptionArn: data.SubscriptionArn
      })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const meDeletarDaLista = (req, res, next) => {
  const deletar = snsInit
    .unsubscribe({ SubscriptionArn: req.params.subscriptionArn })
    .promise()

  deletar
    .then(data => {
      res.send(HttpStatus.OK, {
        mensagem: 'Você foi deletado da lista com sucesso.'
      })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const enviarSMSTopico = (req, res, next) => {
  const enviar = snsInit
    .publish({ TopicArn: req.body.topicARN, Message: req.body.message })
    .promise()

  enviar
    .then(data => {
      res.send(HttpStatus.CREATED, {
        messageID: data.MessageId
      })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const function_test = (req, res, next) => {
  request("https://git4wdq4yb.execute-api.us-east-1.amazonaws.com/function_test")
  .then(res1 => res.send(HttpStatus.OK, res1))
  .catch(err1 => res.send(HttpStatus.BAD_REQUEST, err1))  
}

const enviarSMSUnico = (req, res, next) => {
  const enviar = snsInit
    .publish({ PhoneNumber: req.body.phoneNumber, Message: req.body.message })
    .promise()

  enviar
    .then(data => {
      res.send(HttpStatus.CREATED, {
        messageID: data.MessageId
      })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

// Endpoints
server.get('/', (req, res) => res.send({ mensagem:`Iniciando com AWS SNS.` }))
server.get('/topico', listarTopicos)
server.post('/topico', criarTopico)
server.del('/topico/:arn', deletarTopico)
server.post('/inscricao', meAdicionarNaLista)
server.del('/inscricao/:subscriptionArn', meDeletarDaLista)
server.post('/sms/topico', enviarSMSTopico)
server.post('/sms/unico', enviarSMSUnico)
server.get('/function_test', function_test)

// Server
server.listen(env.port, () => {
  console.info(`[server.js] - Server running on http://${env.host}:${env.port}`)
})
