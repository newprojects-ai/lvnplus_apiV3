export interface CreateTopicDTO {
  name: string;
  description?: string;
  subjectId: number;
}

export interface UpdateTopicDTO {
  name?: string;
  description?: string;
  subjectId?: number;
}

export interface SubtopicResponse {
  id: string;
  name: string;
  description: string | null;
  topicId: string;
}

export interface TopicResponse {
  id: string;
  name: string;
  description: string | null;
  subjectId: string;
  subtopics: SubtopicResponse[];
}
