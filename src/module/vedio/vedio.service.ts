import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVedioDto } from './dto/create-vedio.dto';
import { CreateTopikDto } from './dto/create-topik.dto';
import { UpdateVedioDto } from './dto/update-vedio.dto';
import { VideoEntity } from 'src/entities/video.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { TopikEntity } from 'src/entities/topik.entity';
import { takeUtils } from 'src/utils/take.utils';
import { googleCloud } from 'src/utils/google-cloud';
import { extname } from 'path';

@Injectable()
export class VedioService {
  async createCourseVedio(
    createVedioDto: CreateVedioDto,
    link: Express.Multer.File,
  ): Promise<void> {
    const vedio: string = googleCloud(link);
    const ext: string = extname(vedio);

    const course: CourseEntity = await CourseEntity.findOne({
      where: {
        id: createVedioDto.course_id,
      },
      relations: {
        course_videos: true,
      },
    }).catch(() => undefined);

    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (!Number(createVedioDto.sequence)) {
      throw new HttpException('Sequence a number', HttpStatus.NOT_FOUND);
    }

    const findCourse = course.course_videos?.find(
      (e) => e.sequence === Number(createVedioDto.sequence),
    );

    if (findCourse) {
      throw new HttpException(
        'There is a video of this sequence',
        HttpStatus.CONFLICT,
      );
    }

    if (ext == '.mp4') {
      await VideoEntity.createQueryBuilder()
        .insert()
        .into(VideoEntity)
        .values({
          link: vedio,
          title: createVedioDto.title,
          sequence: Number(createVedioDto.sequence),
          description: createVedioDto.description,
          duration: createVedioDto.duration,
          course: createVedioDto.course_id as any,
        })
        .execute()
        .catch(() => {
          throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        });
    } else {
      throw new HttpException(
        'The file type is not correct',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTopikVedio(
    body: CreateTopikDto,
    link: Express.Multer.File,
  ): Promise<void> {
    const topikVedio: string = googleCloud(link);
    const ext: string = extname(topikVedio);

    const topik: TopikEntity = await TopikEntity.findOne({
      where: {
        id: body.topik_id,
      },
      relations: {
        topik_videos: true,
      },
    }).catch(() => undefined);

    if (!topik) {
      throw new HttpException('Topik Not Found', HttpStatus.NOT_FOUND);
    }

    if (!Number(body.sequence)) {
      throw new HttpException('Sequence a number', HttpStatus.NOT_FOUND);
    }

    const findTopik: VideoEntity = topik.topik_videos?.find(
      (e) => e.sequence === Number(body.sequence),
    );

    if (findTopik) {
      throw new HttpException(
        'There is a video of this sequence',
        HttpStatus.CONFLICT,
      );
    }

    if (ext == '.mp4') {
      await VideoEntity.createQueryBuilder()
        .insert()
        .into(VideoEntity)
        .values({
          link: topikVedio,
          title: body.title,
          sequence: Number(body.sequence),
          description: body.description,
          duration: body.duration,
          topik: body.topik_id as any,
        })
        .execute()
        .catch(() => {
          throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        });
    } else {
      throw new HttpException(
        'The file type is not correct',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findCourseVedio(id: string) {
    const course = await CourseEntity.findOne({
      where: {
        id,
      },
      relations: {
        course_videos: true,
      },
      order: {
        course_videos: {
          sequence: 'ASC',
        },
      },
    }).catch(() => undefined);

    if (!course) {
      const topik = await TopikEntity.findOne({
        where: {
          id,
        },
        relations: {
          topik_videos: true,
        },
        order: {
          topik_videos: {
            sequence: 'ASC',
          },
        },
      }).catch(() => undefined);

      if (!topik) {
        throw new HttpException(
          'Course and Topik not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return topik;
    } else {
      return course;
    }
  }

  async findOne(id: string, req: any): Promise<VideoEntity> {
    const { user_id } = req;
    const findVedio: VideoEntity = await VideoEntity.findOne({
      relations: {
        course: true,
        topik: true,
        workbook: true,
      },
      where: {
        id: id,
      },
      order: {
        sequence: 'ASC',
      },
    });
    if (!findVedio) {
      throw new HttpException('Vedio Not Found', HttpStatus.NOT_FOUND);
    }
    const byTake = await takeUtils(
      findVedio.course ? findVedio.course?.id : findVedio.topik?.id,
      user_id,
    );
    if (byTake.status === 200) {
      return findVedio;
    } else {
      throw new HttpException(
        'Siz hali courseni sotib olmagansiz',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: string,
    updateVedioDto: UpdateVedioDto,
    link: Express.Multer.File,
  ): Promise<void> {
    const Vediolink: string = googleCloud(link);
    const ext = extname(Vediolink);

    const findVedio = await VideoEntity.findOne({
      where: {
        id,
      },
      order: {
        sequence: 'ASC',
      },
    }).catch(() => undefined);

    if (!findVedio) {
      throw new HttpException('Vedio not found', HttpStatus.NOT_FOUND);
    }

    const findSeq: VideoEntity[] = await VideoEntity.find();

    if (findSeq.find((e) => e.sequence == Number(updateVedioDto.sequence))) {
      throw new HttpException(
        'There is a video of this sequence',
        HttpStatus.CONFLICT,
      );
    }

    if (ext == '.mp4') {
      await VideoEntity.createQueryBuilder()
        .update(VideoEntity)
        .set({
          link: Vediolink ? Vediolink : findVedio.link,
          title: updateVedioDto.title ? updateVedioDto.title : findVedio.title,
          sequence: updateVedioDto.sequence
            ? Number(updateVedioDto.sequence)
            : findVedio.sequence,
          description: updateVedioDto.description
            ? updateVedioDto.description
            : findVedio.description,
          duration: updateVedioDto.duration
            ? updateVedioDto.duration
            : findVedio.duration,
          topik: updateVedioDto.topik_id
            ? updateVedioDto.topik_id
            : (findVedio.topik as any),
          course: updateVedioDto.course_id
            ? updateVedioDto.course_id
            : (findVedio.course as any),
        })
        .where({ id })
        .execute()
        .catch(() => {
          throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        });
    } else {
      throw new HttpException(
        'The file type is not correct',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const findVedio = await VideoEntity.findOne({
      where: {
        id,
      },
    }).catch(() => undefined);

    if (!findVedio) {
      throw new HttpException('Vedio not found', HttpStatus.NOT_FOUND);
    }

    await VideoEntity.createQueryBuilder()
      .delete()
      .from(VideoEntity)
      .where({ id })
      .execute();
  }
}
