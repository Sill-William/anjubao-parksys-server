import { Body, Controller, Get, Logger, Post, Query, Render, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { FeedbackQueryDto } from "src/entity/dto/feedback-query.dto";
import { FeedbackDto } from "src/entity/dto/feedback.dto";
import { Feedback } from "src/entity/feedback.entity";
import { OperationFactory } from "src/util/factory/operation.factory";
import { Repository } from "typeorm";

@Controller('/feedback')
export class FeedbackController {
  private readonly log: Logger = new Logger(FeedbackController.name)
  constructor(
    @InjectRepository(Feedback) private readonly feedbackRepository: Repository<Feedback>,
  ) {
  }

  @Get('/')
  @Render('module/feedback')
  async manager() {
    return {}
  }

  @Get('/all')
  async all(@Query() feedbackQueryDto: FeedbackQueryDto) {
    const { page, limit } = feedbackQueryDto
    return {
      code: 0,
      data: await this.feedbackRepository.find({
        skip: (page - 1) * limit,
        take: limit
      })
    }
  }

  @Post('/')
  async create(@Body() feedbackDto: FeedbackDto, @Req() req: Request) {
    if (!req['user']) {
      return {
        attached: false,
      }
    }
    let user = req['user']
    feedbackDto.user = user.id || user.sub
    this.log.debug(feedbackDto)
    return await OperationFactory.doOperInCtr(async () => {
      await this.feedbackRepository.save(feedbackDto)
    })
  }
}