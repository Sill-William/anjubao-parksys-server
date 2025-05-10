import { join } from "path";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { UserModule } from "./user.module";
import { RoleModule } from "./role.module";
import { AppController } from "src/controller/app.controller";
import { ParkModule } from "./park.module";
import { OrderModule } from "./order.module";
import { EvaluateModule } from "./evaluate.module";
import { AuthModule } from "./auth.module";
import { ParkFeeModule } from "./park-fee.module";
import { RedisModule } from "@nestjs-modules/ioredis";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CarModule } from "./car.module";
import { UploadModule } from "./upload.module";
import { PaymentModule } from "./payment.module";
import { FeedbackModule } from "./feedback.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '..', '.env.production'),
      ],
      validationSchema: Joi.object({
        HOST: Joi.string().default('localhost').optional().allow(''),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().default('').optional().allow(''),
        MQ_HOST: Joi.string().required(),
        MQ_PORT: Joi.number().required(),
        MQ_QUEUE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().required(),
        JWT_TOKEN_ISSUER: Joi.string().required(),
        JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
        TENCENT_LOCATION_SERVICE_KEY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    RedisModule.forRoot({
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
      type: "single"
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true, // 自动加载实体
      entities: [join(__dirname, '..', 'entity', '*.entity{.ts,.js}')],  
      synchronize: true,
      cache: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'MQ_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get<string>('MQ_HOST')}:${configService.get<number>('MQ_PORT')}`,
            ],
            queue: configService.get<string>('MQ_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ScheduleModule.forRoot(),
    UserModule,
    RoleModule,
    ParkModule,
    OrderModule,
    EvaluateModule,
    AuthModule,
    ParkFeeModule,
    CarModule,
    UploadModule,
    PaymentModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}