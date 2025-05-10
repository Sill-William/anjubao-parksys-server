import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "src/entity/car.entity";
import { CarQueryDto } from "src/entity/dto/car-query.dto";
import { CarDto } from "src/entity/dto/car.dto";
import { Repository } from "typeorm";
import { UserService } from "./user.service";
import { User } from "src/entity/user.entity";

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @Inject(UserService) private readonly userService: UserService
  ) {}

  async all(carQueryDto: CarQueryDto) {
    const { page, limit, user, sign } = carQueryDto
    // const cars = await this.carRepository.find({
    //   where: {
    //     user,
    //     sign
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    // })
    // return cars.map((car) => ({
    //   ...car,
    //   user: car.user ? this.userService.getUserById(car.user) : ''
    // }))
    const qb = await this.carRepository.createQueryBuilder('car')
      .leftJoinAndSelect(User, 'user', 'car.user = user.id')
    if (user) {
      qb.andWhere('user.id = :user', { user })
      // qb.andWhere('car.restricted = 0')
    }
    if (sign) {
      qb.andWhere('car.sign = :sign', { sign })
    }
    return await qb.skip((page - 1) * limit).take(limit).getRawMany()
  }

  async create(carDto: CarDto) {
    return await this.carRepository.save(carDto)
  }

  async remove(id: string) {
    return await this.carRepository.delete(id)
  }

  async update(id: string, carDto: CarDto) {
    return await this.carRepository.update(id, carDto)
  }
}