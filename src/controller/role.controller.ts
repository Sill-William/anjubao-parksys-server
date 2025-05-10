import { Body, Controller, Get, Inject, Post, Render } from "@nestjs/common";
import { RoleDto } from "src/entity/dto/role.dto";
import { RoleService } from "src/service/role.service";

@Controller('/role')
export class RoleController {

  constructor(
    @Inject(RoleService) private readonly roleService: RoleService
  ) {}

  @Post('/')
  async create(@Body() body: RoleDto) {
    try {
      await this.roleService.create(body)
      return { attached: true }
    } catch (_) {
      return { attached: false } 
    }
  }

  @Get('/')
  @Render('module/role')
  async manager() {
    return {}
  }

  @Get('/all')
  async all() {
    return {
      code: 0,
      data: await this.roleService.allRole()
    }
  }
}