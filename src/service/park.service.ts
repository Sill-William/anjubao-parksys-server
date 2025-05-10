import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Redis from "ioredis";
import { ParkAssociateDto } from "src/entity/dto/park-associate.dto";
import { ParkQueryDto } from "src/entity/dto/park-query.dto";
import { ParkDto } from "src/entity/dto/park.dto";
import { Park } from "src/entity/park.entity";
import { Like, Or, Repository } from "typeorm";

@Injectable()
export class  ParkService {

  // private parkConcurrentCarCnt: Map<String, Number> = new Map(); 
  private readonly log: Logger = new Logger(ParkService.name);

  constructor(
    @InjectRepository(Park) private readonly parkRepository: Repository<Park>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    parkRepository.find().then((parks: Park[]) => {
      const parkConcurrentCarCnt: Map<String, Number> = parks.reduce((acc, cur) => {
        acc.set(cur.id, cur.capacity - cur.rest)
        return acc;
      }, new Map())
      // store to redis cache
      this.redis.set('parkConcurrentCarCnt', JSON.stringify(parkConcurrentCarCnt))
      this.log.debug('parkConcurrentCarCnt load into redis cache')
    })
  }

  async select(id: string) {
    return await this.parkRepository.findOne({ where: { id } });
  }

  async getParks(parkQueryDto: ParkQueryDto) {
    const { page, limit, id, name, address } = parkQueryDto;
    let qb = this.parkRepository.createQueryBuilder('park')
    if (id) {
      qb = qb.andWhere('park.id = :id', { id })
    }
    if (name) {
      qb = qb.andWhere('park.name = :name', { name })
    }
    if (address) {
      qb = qb.andWhere('park.address = :address', { address })
    }
    return await qb.skip((page - 1) * limit).take(limit).getMany()
  }

  async getParksByKeyword(parkQueryDto: ParkQueryDto) {
    const { page, limit, name } = parkQueryDto; 
    const parks = await this.parkRepository.find({
      where: [
        { name: Like(`%${name}%`) },
        { address: Like(`%${name}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit, 
    })
    return parks
  }

  async idList(parkAssociateDto: ParkAssociateDto) {
    const { keyword } = parkAssociateDto
    return await this.parkRepository.find({
      select: ['id', 'name', 'address'], 
      where: keyword ? [
        { address: Like(`%${keyword}%`) }, { name: Like(`%${keyword}%`) },
      ]: undefined
    })
  }

  async create(parkDto: ParkDto) {
    if (!parkDto.rest) {
      parkDto.rest = parkDto.capacity
    }
    return await this.parkRepository.save(parkDto);
  }

  async update(parkDto: ParkDto) {
    return await this.parkRepository.update(parkDto.id, parkDto);
  }

  async remove(id: string) {
    return await this.parkRepository.softDelete(id);
  }

  async lock(id: string) {
    this.changeRest(id, -1)
  }

  async release(id: string) {
    this.changeRest(id, 1)
  }

  private async changeRest(id: string, add: number) {
    this.parkRepository.manager.transaction(async (transactionalEntityManager) => {
      const park = await transactionalEntityManager.findOne(Park, {
        where: { id },
      })
      if (!park) {
        throw new Error('park not found')
      }
      if (park.rest + add > park.capacity) {
        throw new Error('park is empty') 
      } else if (park.rest + add < 0) {
        throw new Error('park is full') 
      }
      park.rest += add
      await transactionalEntityManager.save(park) 
      // update redis cache
      const parkConcurrentCarCnt = JSON.parse(await this.redis.get('parkConcurrentCarCnt'))
      parkConcurrentCarCnt[id] += add
      await this.redis.set('parkConcurrentCarCnt', JSON.stringify(parkConcurrentCarCnt))
    }) 
  }
}