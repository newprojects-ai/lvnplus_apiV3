import { PrismaClient } from '@prisma/client';
import { CreateTopicDTO, UpdateTopicDTO, TopicResponse } from '../types';
import { NotFoundError } from '../utils/errors';

export class TopicService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getTopics(): Promise<TopicResponse[]> {
    const topics = await this.prisma.topics.findMany({
      orderBy: {
        topic_name: 'asc'
      }
    });
    return topics;
  }

  async createTopic(data: CreateTopicDTO): Promise<TopicResponse> {
    const topic = await this.prisma.topics.create({
      data: {
        topic_name: data.name,
        description: data.description || null,
        subject_id: data.subjectId
      }
    });
    return topic;
  }

  async getTopic(id: number): Promise<TopicResponse> {
    const topic = await this.prisma.topics.findUnique({
      where: {
        topic_id: id
      }
    });

    if (!topic) {
      throw new NotFoundError('Topic not found');
    }

    return topic;
  }

  async updateTopic(id: number, data: UpdateTopicDTO): Promise<TopicResponse> {
    const topic = await this.prisma.topics.update({
      where: {
        topic_id: id
      },
      data: {
        topic_name: data.name,
        description: data.description,
        subject_id: data.subjectId
      }
    });

    return topic;
  }

  async deleteTopic(id: number): Promise<void> {
    try {
      await this.prisma.topics.delete({
        where: {
          topic_id: id
        }
      });
    } catch (error) {
      throw new NotFoundError('Topic not found');
    }
  }

  async getTopicsBySubject(subjectId: number): Promise<TopicResponse[]> {
    const topics = await this.prisma.topics.findMany({
      where: {
        subject_id: subjectId
      },
      orderBy: {
        topic_name: 'asc'
      }
    });
    return topics;
  }
}