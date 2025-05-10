import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Render } from "@nestjs/common";
import { EvaluateQueryDto } from "src/entity/dto/evaluate-query.dto";
import { EvaluateDto } from "src/entity/dto/evaluate.dto";
import { EvaluateService } from "src/service/evaluate.service";

@Controller('evaluate')
export class EvaluateController {
  constructor(
    @Inject(EvaluateService) private readonly evaluateService: EvaluateService
  ) {}

  @Get('/')
  @Render('module/evaluate')
  async manager() {
    return {}
  }

  @Get('/all')
  async all(@Query() evaluateQueryDto: EvaluateQueryDto) {
    return {
      code: 0,
      data: await this.evaluateService.getEvaluate(evaluateQueryDto)
    }
  }  

  @Post('/')
  async create(@Body() evaluateDto: EvaluateDto) {
    try {
        await this.evaluateService.create(evaluateDto)
      return {
        attached: true,
      }
    } catch (e) {
      return {
        attached: false,
      }
    }
  }

  @Delete('/:id')
  async del(@Param('id') id: string) {
    try {
      await this.evaluateService.remove(id)
      return {
        attached: true,
      }
    } catch (e) {
      return {
        attached: false
      }
    }
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() evaluateDto: EvaluateDto) {
    try {
      await this.evaluateService.update(id, evaluateDto)
      return {
        attached: true,
      }
    } catch (e) {
      return {
        attached: false
      }
    }
  }
}