import { PrismaClient } from '@prisma/client';
import { CreateTopicDTO, UpdateTopicDTO, TopicResponse, SubtopicResponse } from '../types/topic';
import { AppError } from '../utils/error';

const prisma = new PrismaClient();

export class TopicService {
  async getTopics(): Promise<TopicResponse[]> {
    try {
      const topics = await prisma.topics.findMany({
        include: {
          subtopics: true
        },
        orderBy: {
          topic_name: 'asc'
        }
      });

      return topics.map(topic => ({
        id: topic.topic_id.toString(),
        name: topic.topic_name,
        description: topic.description,
        subjectId: topic.subject_id.toString(),
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.subtopic_id.toString(),
          name: subtopic.subtopic_name,
          description: subtopic.description,
          topicId: subtopic.topic_id.toString()
        }))
      }));
    } catch (error: unknown) {
      console.error('Error getting topics:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get topics: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get topics: Unknown error');
    }
  }

  async createTopic(data: CreateTopicDTO): Promise<TopicResponse> {
    try {
      const topic = await prisma.topics.create({
        data: {
          topic_name: data.name,
          description: data.description || null,
          subject_id: Number(data.subjectId)
        },
        include: {
          subtopics: true
        }
      });

      return {
        id: topic.topic_id.toString(),
        name: topic.topic_name,
        description: topic.description,
        subjectId: topic.subject_id.toString(),
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.subtopic_id.toString(),
          name: subtopic.subtopic_name,
          description: subtopic.description,
          topicId: subtopic.topic_id.toString()
        }))
      };
    } catch (error: unknown) {
      console.error('Error creating topic:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to create topic: ${error.message}`);
      }
      throw new AppError(500, 'Failed to create topic: Unknown error');
    }
  }

  async getTopic(id: bigint): Promise<TopicResponse> {
    try {
      const topic = await prisma.topics.findUnique({
        where: {
          topic_id: Number(id)
        },
        include: {
          subtopics: true
        }
      });

      if (!topic) {
        throw new AppError(404, 'Topic not found');
      }

      return {
        id: topic.topic_id.toString(),
        name: topic.topic_name,
        description: topic.description,
        subjectId: topic.subject_id.toString(),
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.subtopic_id.toString(),
          name: subtopic.subtopic_name,
          description: subtopic.description,
          topicId: subtopic.topic_id.toString()
        }))
      };
    } catch (error: unknown) {
      console.error('Error getting topic:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get topic: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get topic: Unknown error');
    }
  }

  async updateTopic(id: bigint, data: UpdateTopicDTO): Promise<TopicResponse> {
    try {
      const topic = await prisma.topics.update({
        where: {
          topic_id: Number(id)
        },
        data: {
          topic_name: data.name,
          description: data.description || null,
          subject_id: data.subjectId ? Number(data.subjectId) : undefined
        },
        include: {
          subtopics: true
        }
      });

      return {
        id: topic.topic_id.toString(),
        name: topic.topic_name,
        description: topic.description,
        subjectId: topic.subject_id.toString(),
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.subtopic_id.toString(),
          name: subtopic.subtopic_name,
          description: subtopic.description,
          topicId: subtopic.topic_id.toString()
        }))
      };
    } catch (error: unknown) {
      console.error('Error updating topic:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(500, `Failed to update topic: ${error.message}`);
      }
      throw new AppError(500, 'Failed to update topic: Unknown error');
    }
  }

  async deleteTopic(id: bigint): Promise<void> {
    try {
      await prisma.topics.delete({
        where: {
          topic_id: Number(id)
        }
      });
    } catch (error: unknown) {
      console.error('Error deleting topic:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(500, `Failed to delete topic: ${error.message}`);
      }
      throw new AppError(500, 'Failed to delete topic: Unknown error');
    }
  }

  async getTopicsBySubject(subjectId: bigint): Promise<TopicResponse[]> {
    try {
      const topics = await prisma.topics.findMany({
        where: {
          subject_id: Number(subjectId)
        },
        include: {
          subtopics: true
        },
        orderBy: {
          topic_name: 'asc'
        }
      });

      return topics.map(topic => ({
        id: topic.topic_id.toString(),
        name: topic.topic_name,
        description: topic.description,
        subjectId: topic.subject_id.toString(),
        subtopics: topic.subtopics.map(subtopic => ({
          id: subtopic.subtopic_id.toString(),
          name: subtopic.subtopic_name,
          description: subtopic.description,
          topicId: subtopic.topic_id.toString()
        }))
      }));
    } catch (error: unknown) {
      console.error('Error getting topics by subject:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get topics by subject: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get topics by subject: Unknown error');
    }
  }
}