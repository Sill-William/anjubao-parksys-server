import { Controller, Get } from "@nestjs/common";

@Controller('/payment')
export class PaymentController {
  @Get('/')
  async mockPay() {
    return {
      'status': 'success',
      'message': '支付成功'
    }
  }
}