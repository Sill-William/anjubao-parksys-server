import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { ParkFeeQueryDto } from "src/entity/dto/park-fee-query.dto";
import { ParkFeeDto } from "src/entity/dto/park-fee.dto";
import { ParkFee } from "src/entity/park-fee.entity";
import { Repository } from "typeorm";

@Injectable()
export class ParkFeeService {
  constructor(
    @InjectRepository(ParkFee) private readonly parkFeeRepository: Repository<ParkFee>,
  ) {}

  async getParkFee(parkFeeQueryDto: ParkFeeQueryDto) {
    const { park } = parkFeeQueryDto
    return await this.parkFeeRepository.find({
      where: {
        park
      }
    })
  }

  async create(parkFeeDto: ParkFeeDto) { 
    this.parkFeeRepository.save(parkFeeDto)
  }

  async remove(id: string) {
    this.parkFeeRepository.softDelete(id)
  }

  async update(id: string, parkFeeDto: ParkFeeDto) {
    this.parkFeeRepository.update(id, parkFeeDto)
  }

  async calculateCost(park: string, start: Date, end: Date): Promise<number> {
    let fees = await this.parkFeeRepository.find({
      where: {
        park
      }
    })
    let mStart = moment(start)
    // let mStart = new 
    let mEnd = moment(end)
    let calculate = (feeStartDate: Date, feeEndDate: Date, fee: number) => {
        let feeStartHours = feeStartDate.getHours() + feeStartDate.getMinutes() / 60
        let feeEndHours = feeEndDate.getHours() + feeEndDate.getMinutes() / 60
        let startHours = mStart.hour() + mStart.minute() / 60
        let endHours = mEnd.hour() + mEnd.minute() / 60
        if (startHours < feeStartHours && endHours < feeEndHours || startHours > feeEndHours && endHours > feeEndHours) {
          return 0 
        }
        if (startHours < feeStartHours && endHours > feeEndHours) {
          return fee
        }
        if (startHours > feeStartHours && endHours < feeEndHours) {
          return fee * (endHours - startHours)
        }
        if (startHours < feeStartHours && endHours < feeEndHours) {
          return fee * (endHours - feeStartHours) 
        }
        if (startHours > feeStartHours && endHours > feeEndHours) {
          return fee * (feeEndHours - startHours) 
        }
        return 0
    }
    // get the days between start and end
    let days = mEnd.diff(mStart, 'days')
    if (days > 1) { // more than 1 day, we should calculate the special cost of the first and last day, and the rest of the days
      let mStart2NextD = mStart.clone().add(1, 'days').set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      let mStartDEnd = mStart2NextD.clone().set({
        hour: 23,
        minute: 59,
        second: 59,
      })
      let mEnd2PrevD = mEnd.clone().subtract(1, 'days').set({
        hour: 23,
        minute: 59,
        second: 59, 
      })
      let mEndPrevDStart = mEnd2PrevD.clone().set({
        minute: 0,
        second: 0,
        millisecond: 0, 
      })
      let calculatedStartDayCost = fees.map((fee) => {
        return calculate(fee.start, fee.end, fee.fee)
      }).reduce((acc, cur) => acc + cur, 0)
      let calculatedEndDayCost = fees.map((fee) => {
        return calculate(fee.start, fee.end, fee.fee) 
      }).reduce((acc, cur) => acc + cur, 0)
      let calculatedMiddleDaysCost = fees.map((fee) => fee.fee).reduce((acc, cur) => acc + cur, 0) * days
      return calculatedStartDayCost + calculatedEndDayCost + calculatedMiddleDaysCost
    }
    let calculatedCost = fees.map((fee) => {
      return calculate(fee.start, fee.end, fee.fee)
    }).reduce((acc, cur) => acc + cur, 0)
    return calculatedCost
  }

}