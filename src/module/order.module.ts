import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderController } from "src/controller/order.controller";
import { Order } from "src/entity/order.entity";
import { OrderService } from "src/service/order.service";
import { ParkFeeModule } from "./park-fee.module";
import { ParkModule } from "./park.module";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ParkFeeModule,
    ParkModule,
    TypeOrmModule.forFeature([Order]),
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
              // deadLetterExchange: configService.get<string>('MQ_DEAD_LETTER_EXCHANGE'),
              // deadLetterRoutingKey: configService.get<string>('MQ_DEAD_LETTER_ROUTING_KEY'),
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule { }