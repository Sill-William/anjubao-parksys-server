import { Body, Controller, Delete, Get, Inject, Logger, Param, Post, Put, Query, Render, Req } from "@nestjs/common";
import axios from "axios";
import { ParkImageQueryDto } from "src/entity/dto/park-image-query.dto";
import { ParkQueryDto } from "src/entity/dto/park-query.dto";
import { ParkDto } from "src/entity/dto/park.dto";
import { ParkService } from "src/service/park.service";
import * as fs from 'fs'
import { ParkAssociateDto } from "src/entity/dto/park-associate.dto";
import { Request } from "express";

@Controller('/park')
export class ParkController {

  private readonly tcApiKey: string = process.env.TENCENT_LOCATION_SERVICE_KEY ?? ''

  private readonly log: Logger = new Logger(ParkController.name)

  constructor(
    @Inject(ParkService) private readonly parkService: ParkService
  ) {
  }

  @Get('/')
  @Render('module/park')
  async manager() {
    return {} 
  }

  @Get('/all')
  async all(@Query() parkQueryDto: ParkQueryDto, @Req() req: Request) {
    if (!req['user']) {
      return {
        code: 1,
        message: '未登录'
      }
    }
    const user = req['user']
    const plugin = user.plugin
    if (!!plugin) {
      parkQueryDto.id = plugin
    }
    return {
      code: 0,
      data: await this.parkService.getParks(parkQueryDto)
    }
  }

  @Get('/all-by-keyword')
  async allByKeyword(@Query() parkQueryDto: ParkQueryDto) {
    return {
      code: 0,
      data: await this.parkService.getParksByKeyword(parkQueryDto)
    }
  }

  @Post('/')
  async create(@Body() parkDto: ParkDto) {
    try {
      await this.parkService.create(parkDto)
      return {
        attached: true,
      }
    } catch (e) {
      this.log.error(e)
      return {
        attached: false,
      }
    }
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.parkService.remove(id)
      return {
        attached: true,
      }
    } catch (e) {
      return {
        attached: false,
      }
    }
  }

  @Put('/')
  async update(@Body() parkDto: ParkDto) {
    try {
      await this.parkService.update(parkDto)
      return {
        attached: true,
      }
    } catch (e) {
      console.error(e)
      return {
        attached: false,
      }
    }
  }

  @Get('/associate/:address')
  async addressAssociate(@Param('address') address: string) {
    if (this.tcApiKey === '') {
      return {
        attached: false,
        message: '未配置腾讯位置服务API Key'
      }
    }
    try {
      let result = await axios({
        url: `https://apis.map.qq.com/ws/place/v1/suggestion?key=${this.tcApiKey}&keyword=${address}&region=哈尔滨&region_fix=1`,
        method: 'get',
      })
      result = result.data.data
      return {
        attached: true,
        data: result
      }
    } catch (e) {
      return {
        attached: false,
        message: '腾讯位置服务API Key配置错误'
      }
    }
  }

  @Get('/location/image')
  async lngLat2Image(@Query() parkImageQueryDto: ParkImageQueryDto) {
    try {
      let result = await axios({
        url: `https://apis.map.qq.com/ws/staticmap/v2/?key=${this.tcApiKey}&center=${parkImageQueryDto.lat},${parkImageQueryDto.lng}&size=512*246&zoom=15&scale=2`,
        method: 'get',
        responseType: 'arraybuffer'
      })
      const buffer = Buffer.from(result.data, 'ascii')
      const base64 = "data:image/png;base64," + buffer.toString('base64')
      return {
        attached: true,
        data: base64
      }
    } catch (e) {
      console.error(e)
      return {
        attached: false,
        message: '腾讯位置服务API Key配置错误'
      }
    }
  }

  @Get('/all/ids')
  async allIds(@Query() parkAssociateDto: ParkAssociateDto) {
    return {
      attached: true,
      data: await this.parkService.idList(parkAssociateDto)
    }
  }

}