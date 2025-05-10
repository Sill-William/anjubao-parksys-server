import { Body, Controller, Delete, Get, Param, Post, Put, Query, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ParkFeeQueryDto } from "src/entity/dto/park-fee-query.dto";
import { ParkFeeDto } from "src/entity/dto/park-fee.dto";
import { ParkFeeService } from "src/service/park-fee.service";
import { OperationFactory } from "src/util/factory/operation.factory";

@Controller('/park-fee')
export class ParkFeeController {
  constructor(
    private readonly parkFeeService: ParkFeeService,
  ) {}

  @Get('/')
  async toManager(@Req() req: Request, @Res() res: Response) {
    if (!req['user']) {
      return res.redirect('/auth/in')
    }
    const user = req['user']
    if (user.role !== 'parkadmin' || !user.plugin) {
      return res.redirect('/background/tg')
    }
    return res.redirect('/park-fee/mgr')
  }

  @Get('/mgr')
  @Render('module/park-fees')
  async manager(@Req() req: Request) {
    if (!req['user']) {
      throw new Error('请先登录')
    }
    const user = req['user']
    const plugin = user.plugin
    if (user.role !== 'parkadmin' || !plugin) {
      throw new Error('用户身份错误')
    }
    return {
      parkId: plugin,
    }
  }

  @Get('/all')
  async all(@Query() parkFeeQueryDto: ParkFeeQueryDto, @Req() req: Request) {
    if (!req['user']) {
      return {
        code: 1,
        msg: '请先登录', 
      }
    }
    const user = req['user']
    if (user.role !== 'parkadmin' && !user.plugin) {
      return {
        code: 1,
        msg: '用户身份错误',
      }
    }
    parkFeeQueryDto.park = user.plugin    
    return {
      code: 0,
      data: await this.parkFeeService.getParkFee(parkFeeQueryDto),
    }
  }

  @Post('/')
  async create(@Body() parkFeeDto: ParkFeeDto) {
    return await OperationFactory.doOperInCtr(async () => {
      await this.parkFeeService.create(parkFeeDto)
    })
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return await OperationFactory.doOperInCtr(async () => {
      await this.parkFeeService.remove(id.toString()) 
    })
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() parkFeeDto: ParkFeeDto) {
    return await OperationFactory.doOperInCtr(async () => {
      await this.parkFeeService.update(id, parkFeeDto) 
    })
  }

}