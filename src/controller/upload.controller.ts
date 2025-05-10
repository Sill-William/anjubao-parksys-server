import { Controller, Inject, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/config/multer.config";

@Controller('upload')
export class UploadController {

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const baseUrl = `${this.configService.get<string>('HOST')}:${this.configService.get<string>('PORT')}`
    return {
      attached: true,
      url: `http://${baseUrl}/public/upload-img/${file.filename}`,
      name: file.filename
    }
  }
}