import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, Render, Req } from "@nestjs/common";
import { Request } from "express";
import { CarQueryDto } from "src/entity/dto/car-query.dto";
import { CarDto } from "src/entity/dto/car.dto";
import { CarService } from "src/service/car.service";
import { OperationFactory } from "src/util/factory/operation.factory";

@Controller('/car')
export class CarController {
  constructor(
    @Inject(CarService) private readonly carService: CarService
  ) {
  }

  @Get('/')
  @Render('module/car')
  async manager() {
  }

  @Get('/all')
  async all(@Req() req: Request, @Query() carQueryDto: CarQueryDto) {
    let user = req['user']
    if (!user) {
      return {
        code: 1,
        message: '用户未登录'
      }
    }
    if (user.role.indexOf('admin') < 0) {
      carQueryDto.user = user.id || user.sub
    }
    return {
      code: 0,
      data: await this.carService.all(carQueryDto)
    }
  }

  @Post('/')
  async create(@Req() req: Request, @Body() carDto: CarDto) {
    let user = req['user']
    if (!user) {
      return {
        attached: false,
        message: '用户未登录'
      }
    }
    carDto.user = user.id || user.sub
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.create(carDto)
    })
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.remove(id)
    }) 
  }

  @Put('/:id')
  async update(@Query('id') id: string, @Body() carDto: CarDto) {
    OperationFactory.doOperInCtr(async () => {
      await this.carService.update(id, carDto)
    })
  }

  @Patch('/release/:id')
  async release(@Param('id') id: string) {
    const cd = new CarDto()
    cd.id = id
    cd.restricted = 0
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.update(id, cd)
    })
  }

  @Patch('/lock/:id')
  async lock(@Param('id') id: string) {
    const cd = new CarDto()
    cd.id = id
    cd.restricted = 1
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.update(id, cd)
    })
  }

  @Put('release/:id')
  async releaseById(@Param('id') id: string) {
    const cd = new CarDto()
    cd.id = id
    cd.restricted = 0
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.update(id, cd)
    }) 
  }

  @Put('lock/:id')
  async lockById(@Param('id') id: string) {
    const cd = new CarDto()
    cd.id = id
    cd.restricted = 1
    return await OperationFactory.doOperInCtr(async () => {
      await this.carService.update(id, cd)
    })
  }
}