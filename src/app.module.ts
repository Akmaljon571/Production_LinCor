import * as dotenv from 'dotenv';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { connectDb } from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { TokenAdminMiddleWare } from './middleware/token.admin.middleware';
import { TokenUserMiddleWare } from './middleware/token.user.middleware';
import { UsersModule } from './module/users/users.module';
import { VedioModule } from './module/vedio/vedio.module';
import { CoursesModule } from './module/courses/courses.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TestsModule } from './module/tests/tests.module';
import { SertificateModule } from './module/sertificate/sertificate.module';
import { DiscountModule } from './module/discount/discount.module';
import { TakeModule } from './module/take/take.module';
import { JwtModule } from '@nestjs/jwt';
import { OpenWorkbookModule } from './module/open_workbook/open_workbook.module';
import { UserDiscountModule } from './module/user-discount/user-discount.module';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(config),
    TypeOrmModule.forRoot(connectDb),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
        password: '',
      },
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    UsersModule,
    VedioModule,
    CoursesModule,
    TestsModule,
    SertificateModule,
    OpenWorkbookModule,
    TakeModule,
    DiscountModule,
    UserDiscountModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // User
    consumer
      .apply(TokenUserMiddleWare)
      .exclude(
        { path: '/course/all', method: RequestMethod.GET },
        { path: '/course/create', method: RequestMethod.POST },
        { path: '/course/update/:id', method: RequestMethod.PATCH },
        { path: '/course/delete/:id', method: RequestMethod.DELETE },
        { path: '/course/one/:id', method: RequestMethod.GET },
        { path: '/user/registr', method: RequestMethod.POST },
        { path: '/user/registr/:id', method: RequestMethod.POST },
        { path: '/user/register', method: RequestMethod.POST },
        { path: '/user/register/:code', method: RequestMethod.POST },
        { path: '/user/login', method: RequestMethod.POST },
        { path: '/user/login/email/:code', method: RequestMethod.GET },
        { path: '/user/firebase/register', method: RequestMethod.POST },
        { path: '/user/firebase/login', method: RequestMethod.POST },
        { path: '/user/admin/login', method: RequestMethod.POST },
        { path: '/user/admin/login/:code', method: RequestMethod.GET },
        { path: '/user/password', method: RequestMethod.POST },
        { path: '/user/password/:code', method: RequestMethod.GET },
        { path: '/user/password/update', method: RequestMethod.PUT },
        { path: '/user/statistika/daromat', method: RequestMethod.GET },
        { path: '/user/statistika/all', method: RequestMethod.GET },
        { path: '/user/statistika/one/:id', method: RequestMethod.GET },
        { path: '/user/delete/:id', method: RequestMethod.DELETE },
        { path: '/vedio/course', method: RequestMethod.POST },
        { path: '/vedio/topik', method: RequestMethod.POST },
        { path: '/vedio/admin/:id', method: RequestMethod.GET },
        { path: '/vedio/update/:id', method: RequestMethod.PATCH },
        { path: '/vedio/delete/:id', method: RequestMethod.DELETE },
        { path: '/users-discount', method: RequestMethod.GET },
        { path: '/users-discount', method: RequestMethod.POST },
        // { path: '/users-discount/:id', method: RequestMethod.PATCH },
        // { path: '/users-discount/:id', method: RequestMethod.DELETE },
        { path: '/course/list', method: RequestMethod.GET },
        { path: '/course/create', method: RequestMethod.POST },
        { path: '/course/update/:id', method: RequestMethod.PATCH },
        { path: '/course/delete/:id', method: RequestMethod.DELETE },
        { path: '/discount/:id', method: RequestMethod.DELETE },
        { path: '/tests/admin', method: RequestMethod.GET },
        { path: '/tests', method: RequestMethod.POST },
        { path: '/tests/:id', method: RequestMethod.PATCH },
        { path: '/tests/:id', method: RequestMethod.DELETE },
        { path: '/vedio/all', method: RequestMethod.GET },
        { path: '/vedio/create', method: RequestMethod.POST },
        { path: '/take/all', method: RequestMethod.GET },
        { path: '/vedio/course/create', method: RequestMethod.POST },
        { path: '/vedio/topik/create', method: RequestMethod.POST },
        { path: '/vedio/byCourse/:id', method: RequestMethod.GET },
        { path: '/vedio/delete/:id', method: RequestMethod.DELETE },
        { path: '/vedio/update/:id', method: RequestMethod.PATCH },
        { path: '/discount', method: RequestMethod.GET },
        { path: '/discount/:id', method: RequestMethod.GET },
        { path: '/discount', method: RequestMethod.POST },
        { path: '/discount/:id', method: RequestMethod.PATCH },
        { path: '/discount/:id', method: RequestMethod.DELETE },
        { path: '/users-discount', method: RequestMethod.GET },
        { path: '/users-discount', method: RequestMethod.POST },
        { path: '/users-discount/:id', method: RequestMethod.PATCH },
        { path: '/users-discount/:id', method: RequestMethod.DELETE },
        { path: '/take/add', method: RequestMethod.POST },
        { path: '/vedio/topik/create', method: RequestMethod.POST },
        { path: '/user/delete/:id', method: RequestMethod.DELETE },
        { path: '/open_workbook/create', method: RequestMethod.POST },
        { path: '/open_workbook/update/:id', method: RequestMethod.PATCH },
        { path: '/open_workbook/delete/:id', method: RequestMethod.DELETE },
        { path: '/user/statistika/daromat', method: RequestMethod.GET },
        { path: '/user/statistika/users', method: RequestMethod.GET },
        { path: '/user/statistika/search/:search', method: RequestMethod.GET },
        { path: '/user/statistika/:id', method: RequestMethod.GET },
        // { path: '/api/v2/discount', method: RequestMethod.POST },
        { path: '/take/delete/:id', method: RequestMethod.DELETE },
      )
      .forRoutes({ path: '/**', method: RequestMethod.ALL });

    // Admin
    consumer
      .apply(TokenAdminMiddleWare)
      .exclude(
        { path: '/course/all', method: RequestMethod.GET },
        { path: '/course/one/:id', method: RequestMethod.GET },
        { path: '/user/registr', method: RequestMethod.POST },
        { path: '/user/registr/:id', method: RequestMethod.POST },
        { path: '/user/register', method: RequestMethod.POST },
        { path: '/user/register/:id', method: RequestMethod.POST },
        { path: '/user/login', method: RequestMethod.POST },
        { path: '/user/login/email/:code', method: RequestMethod.GET },
        { path: '/user/firebase/register', method: RequestMethod.POST },
        { path: '/user/firebase/login', method: RequestMethod.POST },
        { path: '/user/admin/login', method: RequestMethod.POST },
        { path: '/user/admin/login/:id', method: RequestMethod.GET },
        { path: '/user/password', method: RequestMethod.POST },
        { path: '/user/password/:code', method: RequestMethod.GET },
        { path: '/user/password/update', method: RequestMethod.PUT },
        { path: '/user/update', method: RequestMethod.PATCH },
        { path: '/user/update/password', method: RequestMethod.PUT },
        { path: '/user/update/image', method: RequestMethod.PUT },
        { path: '/user/:course', method: RequestMethod.GET },
        { path: '/user/email', method: RequestMethod.PUT },
        { path: '/user/email/:code', method: RequestMethod.PUT },
        { path: '/user/one', method: RequestMethod.GET },
        { path: '/user/email/:id', method: RequestMethod.PUT },
        { path: '/sertificate/get/:course', method: RequestMethod.GET },
        { path: '/open_workbook/:id', method: RequestMethod.GET },
        { path: '/user/profile', method: RequestMethod.GET },
        { path: '/vedio/:id', method: RequestMethod.GET },
        { path: '/vedio/one/:id', method: RequestMethod.GET },
        { path: '/tests/user', method: RequestMethod.GET },
        { path: '/course/list', method: RequestMethod.GET },
        { path: '/course/:id', method: RequestMethod.GET },
        { path: '/api/v2/discount', method: RequestMethod.POST },
      )
      .forRoutes({ path: '/**', method: RequestMethod.ALL });
  }
}
