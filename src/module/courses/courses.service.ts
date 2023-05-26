import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { TakeEntity } from 'src/entities/take.entity';
import { takeUtils } from 'src/utils/take.utils';

@Injectable()
export class CoursesService {
  async oneFoundCourse(id: string): Promise<CourseEntity> {
    const course = await CourseEntity.findOne({
      where: { id },
      relations: { course_videos: true, open_user: true },
    }).catch(() => {
      throw new HttpException('Bad Request in catch', HttpStatus.NOT_FOUND);
    });
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    return course;
  }

  async create(dto: CreateCourseDto, file: string): Promise<void> {
    const courses = await CourseEntity.find();
    if (courses.length >= 3) {
      throw new HttpException(
        'Courses count is must not more than 3',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const sequency = dto.sequence
    const foundSequency = CourseEntity.findOne({where: {sequence: sequency}})
    console.log(foundSequency);
    
    if (foundSequency) {
      throw new HttpException(
        'Courses` sequency is already has',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    await CourseEntity.createQueryBuilder()
      .insert()
      .into(CourseEntity)
      .values({
        title: dto.title,
        description: dto.description,
        price: dto.price,
        image: file,
        sequence: dto.sequence,
      })
      .execute();
  }

  async findAll(): Promise<CourseEntity[]> {
    return await CourseEntity.find().catch(() => {
      throw new HttpException('Courses Not Found', HttpStatus.NOT_FOUND);
    });
  }

  async findOne(id: string, user_id: any): Promise<CourseEntity> {
    const course = await CourseEntity.findOne({
      where: { id },
      relations: { course_videos: {
        open_book: true
      }, open_user: true, sertifikat: true, discount: true },
    }).catch(() => {
      throw new HttpException('Bad Request in catch', HttpStatus.NOT_FOUND);
    });
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }
    const videos = course.course_videos;
    const openBook = course.course_videos.forEach(e => {
      return e.open_book
    });
    // console.log(openBook);
    
    const courseTaken = await takeUtils(id, user_id);

    let lengthOfVideos = []
    for (let i = 0; i < videos.length; i++) {
      const element = videos[i];
      lengthOfVideos.push(element.duration)
      
      // lengthOfVideos.push(element.duration)
    }

    if ((courseTaken.message && courseTaken.status === 200)) {
      
      return course
    } else {
      for (let i = 0; i < videos.length; i++) {
        
        if (videos[i].sequence <= 2) {
          videos[i].link = videos[i].link;
        } else {
          videos[i].link = '';
        }
      }
      return course
    }
  }

  async update(id: string, dto: UpdateCourseDto, img_link: any): Promise<void> {
    const course = await this.oneFoundCourse(id);
    await CourseEntity.createQueryBuilder()
      .update(CourseEntity)
      .set({
        title: dto.title || course.title,
        description: dto.description || course.description,
        price: dto.price || course.price,
        sequence: dto.sequence || course.sequence,
        image: img_link ? img_link : course.image,
      })
      .where({ id })
      .execute()
      .catch((e) => {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  async remove(id: string): Promise<void> {
    await this.oneFoundCourse(id);
    await CourseEntity.delete(id).catch((e) => {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  }
}
