import { completionDate, convertorDateToDay } from 'src/utils/completion_date';
import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TakeEntity } from 'src/entities/take.entity';
import { UsersEntity } from 'src/entities/users.entity';
import jwt from 'src/utils/jwt';

@Injectable()
export class TokenUserMiddleWare implements NestMiddleware {
  async use(req: Request, _: Response, next: NextFunction) {
    const { headers }: any = req;

    if (!headers.autharization) {
      throw new HttpException('Bad Request in Token', HttpStatus.BAD_REQUEST);
    }
    const idAndEmail = jwt.verify(headers.autharization);

    if (!idAndEmail || !idAndEmail?.id) {
      throw new HttpException('Bad Request in Token', HttpStatus.BAD_REQUEST);
    }
    const user = await UsersEntity.findOne({
      where: {
        id: idAndEmail?.id,
        email: idAndEmail?.email,
      },
    });

    if (!user?.email) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }
    const findBuyCourse: TakeEntity[] = await TakeEntity.find({
      where: {
        user_id: {
          id: user.id,
        },
      },
    });
   

    findBuyCourse.map(async (e) => {

      if(e.active){
        const endDate = completionDate(e.create_data, 6);
        const realTimeCreate = new Date();
        const realTime = completionDate(realTimeCreate, 0);
        const endDays = convertorDateToDay(endDate);
        const realDays = convertorDateToDay(realTime);
  
        if (realDays > endDays) {
          await TakeEntity.createQueryBuilder()
            .update(TakeEntity)
            .set({ active: false })
            .where({ id: e.id })
            .execute();
        }
      } 
    
    });
    req.user_id = user.id;
    next();
  }
}
