import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import { join } from "path"
import * as hbs from 'hbs'
import * as cookieParser from 'cookie-parser';
import { AppModule } from "./module/app.module"
import { ValidationPipe } from "@nestjs/common"
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule
  )
  app.useGlobalPipes(new ValidationPipe())
  app.use(cookieParser())
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.MQ_HOST}:${process.env.MQ_PORT}`
      ],
      queue: process.env.MQ_QUEUE,
      queueOptions: {
        durable: true
      }
    }
  })
  app.enableCors()
  app.useStaticAssets(join(__dirname, '..', 'static'))
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public'
  })
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('hbs')
  hbs.registerPartials(join(__dirname, '..', 'views', 'component'))
  hbs.registerPartials(join(__dirname, '..', 'views', 'layout'))
  hbs.registerPartials(join(__dirname, '..', 'views', 'formatter'))
  hbs.registerHelper('eq', function (a, b) {
    return a === b
  })
  hbs.registerHelper('ne', function (a, b) {
    return a !== b
  })
  hbs.registerHelper('isnull', function (a) {
    return a === null
  })
  app.startAllMicroservices()
  await app.listen(3000)
}

start()