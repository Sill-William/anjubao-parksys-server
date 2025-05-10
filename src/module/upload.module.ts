import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadController } from "src/controller/upload.controller";

@Module({
  imports: [],
  controllers: [UploadController],
  providers: []
})
export class UploadModule { }