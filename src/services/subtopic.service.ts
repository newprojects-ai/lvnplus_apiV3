import { PrismaClient } from '@prisma/client';
import { CreateSubtopicDTO, UpdateSubtopicDTO, SubtopicResponse } from '../types';
import { NotFoundError } from '../utils/errors';

export class SubtopicService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSubtopics(params: { topicId?: number }): Promise<SubtopicResponse[]> {
    const where = params.topicId ? { topic_id: params.topicId } : {};
    const subtopics = await this.prisma.subtopics.findMany({
      where,
      include: {
        topics: {
          include: {
            subjects: true
          }
        }
      }
    });

    return subtopics.map(this.formatSubtopicResponse);
  }

  async getSubtopic(id: number): Promise<SubtopicResponse | null> {
    const subtopic = await this.prisma.subtopics.findUnique({
      where: { subtopic_id: id },
      include: {
        topics: {
          include: {
            subjects: true
          }
        }
      }
    });

    if (!subtopic) {
      return null;
    }

    return this.formatSubtopicResponse(subtopic);
  }

  async createSubtopic(data: CreateSubtopicDTO): Promise<SubtopicResponse> {
    const subtopic = await this.prisma.subtopics.create({
      data: {
        topic_id: data.topicId,
        subtopic_name: data.name,
        description: data.description || null
      },
      include: {
        topics: {
          include: {
            subjects: true
          }
        }
      }
    });

    return this.formatSubtopicResponse(subtopic);
  }

  async updateSubtopic(id: number, data: UpdateSubtopicDTO): Promise<SubtopicResponse> {
    const subtopic = await this.prisma.subtopics.findUnique({
      where: { subtopic_id: id }
    });

    if (!subtopic) {
      throw new NotFoundError('Subtopic not found');
    }

    const updated = await this.prisma.subtopics.update({
      where: { subtopic_id: id },
      data: {
        subtopic_name: data.name,
        description: data.description,
        topic_id: data.topicId
      },
      include: {
        topics: {
          include: {
            subjects: true
          }
        }
      }
    });

    return this.formatSubtopicResponse(updated);
  }

  async deleteSubtopic(id: number): Promise<void> {
    const subtopic = await this.prisma.subtopics.findUnique({
      where: { subtopic_id: id }
    });

    if (!subtopic) {
      throw new NotFoundError('Subtopic not found');
    }

    await this.prisma.subtopics.delete({
      where: { subtopic_id: id }
    });
  }

  private formatSubtopicResponse(subtopic: any): SubtopicResponse {
    return {
      subtopic_id: subtopic.subtopic_id,
      subtopic_name: subtopic.subtopic_name,
      description: subtopic.description,
      topic: {
        topic_id: subtopic.topics.topic_id,
        topic_name: subtopic.topics.topic_name,
        subject: {
          subject_id: subtopic.topics.subjects.subject_id,
          subject_name: subtopic.topics.subjects.subject_name
        }
      },
      created_at: subtopic.created_at,
      updated_at: subtopic.updated_at
    };
  }
}