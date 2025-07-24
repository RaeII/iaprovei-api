import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
import { AiAssistanceMessage } from '@/entities/ai_assistance_message.entity';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { AiAssistanceMessageQuery, AiAssistanceMessageFilter, AiAssistanceMessageListResponse, AiAssistanceMessageDetailedListResponse, AiAssistanceMessageDetail, AiAssistanceMessageCountResponse, AiAssistanceMessageExistsResponse, AiAssistanceMessageCreate, AiAssistanceMessageDetailResponse } from './schemas/ai_assistance_message.schema';
import { createPaginationMeta, generateOffset } from '@/utils/query-utils';
import { AiAssistanceMessageValidator } from './ai_assistance_message.validator';
import { AiAssistanceSessionService } from '@/ai_assistance_session/ai_assistance_session.service';
import { UserBasicInfo } from '@/user/schemas/user.schema';

@Injectable()
export class AiAssistanceMessageService {
  constructor(
    @InjectRepository(AiAssistanceMessage)
    private aiAssistanceMessagesRepository: Repository<AiAssistanceMessage>,
    private aiAssistanceMessageValidator: AiAssistanceMessageValidator,
    private aiAssistanceSessionService: AiAssistanceSessionService
  ) {}

  async create(createAiAssistanceMessageDto: AiAssistanceMessageCreate, userInfo: UserBasicInfo, sessionId: string): Promise<AiAssistanceMessageDetailResponse> {
    await Promise.all([this.aiAssistanceMessageValidator.assertQuestionExists(createAiAssistanceMessageDto.question_id), this.aiAssistanceMessageValidator.assertMessageIsValid(createAiAssistanceMessageDto.message)]);
    // Find existing session or create a new one
    let chat = await this.aiAssistanceSessionService.findByQuestionAndUser(createAiAssistanceMessageDto.question_id, userInfo.id);

    if (!chat) {
      // Create new session
      chat = await this.aiAssistanceSessionService.create({
        question_id: createAiAssistanceMessageDto.question_id,
        user_id: userInfo.id,
        session_id: sessionId,
      });
    }

    // Create the AI assistance message entity with proper enum casting
    const newAiAssistanceMessage = this.aiAssistanceMessagesRepository.create({
      assistence_sessions_id: chat.id,
      sender: createAiAssistanceMessageDto.sender as any,
      message: createAiAssistanceMessageDto.message,
      message_type: createAiAssistanceMessageDto.message_type as any,
    });
    // Save and return the created message
    const savedMessage = await this.aiAssistanceMessagesRepository.save(newAiAssistanceMessage);

    return {
      data: {
        id: savedMessage.id,
        assistence_sessions_id: savedMessage.assistence_sessions_id,
        sender: savedMessage.sender,
        message: savedMessage.message,
        message_type: savedMessage.message_type,
        created_at: savedMessage.created_at,
      },
    };
  }

  /**
   * Retrieve all AI assistance messages with pagination and filtering
   * Filters by user unless user is admin
   */
  async findAll(query: AiAssistanceMessageQuery, userInfo?: { user_id: number; isAdmin?: boolean }): Promise<AiAssistanceMessageListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, userInfo);

    // Select only basic fields for performance
    queryBuilder.select(['message.id', 'message.sender', 'message.message', 'message.message_type', 'message.created_at']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`message.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('message.created_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: messages.map(message => ({
        id: message.id,
        sender: message.sender,
        message: message.message,
        message_type: message.message_type,
        created_at: message.created_at,
      })),
      meta,
    };
  }

  /**
   * Retrieve messages with detailed information including relationships
   * Used when full message data is needed
   * Filters by user unless user is admin
   */
  async findAllDetailed(query: AiAssistanceMessageQuery, userInfo?: { user_id: number; isAdmin?: boolean }): Promise<AiAssistanceMessageDetailedListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, userInfo);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`message.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('message.created_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: messages,
      meta,
    };
  }

  /**
   * Retrieve a single AI assistance message by ID with relationships
   * Checks user ownership unless user is admin
   */
  async findOne(id: number, userInfo?: { user_id: number; isAdmin?: boolean }): Promise<AiAssistanceMessageDetail> {
    const queryBuilder = this.aiAssistanceMessagesRepository.createQueryBuilder('message').leftJoinAndSelect('message.assistanceSession', 'session').leftJoinAndSelect('session.question', 'question').leftJoinAndSelect('session.user', 'user').where('message.id = :id', { id });

    // If user is not admin, filter by user ownership
    if (userInfo && !userInfo.isAdmin) {
      queryBuilder.andWhere('session.user_id = :userId', { userId: userInfo.user_id });
    }

    const message = await queryBuilder.getOne();

    if (!message) {
      throw new DataNotFoundException('AI assistance message not found');
    }

    return {
      id: message.id,
      assistence_sessions_id: message.assistence_sessions_id,
      sender: message.sender,
      message: message.message,
      message_type: message.message_type,
      created_at: message.created_at,
      assistanceSession: message.assistanceSession
        ? {
            id: parseInt(message.assistanceSession.id),
            session_id: message.assistanceSession.session_id,
            question_id: message.assistanceSession.question_id,
            user_id: message.assistanceSession.user_id,
          }
        : undefined,
    };
  }

  /**
   * Retrieve messages by session ID with pagination
   */
  async findBySessionId(sessionId: string, query: Omit<AiAssistanceMessageQuery, 'assistence_sessions_id'>): Promise<AiAssistanceMessageListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.aiAssistanceMessagesRepository.createQueryBuilder('message').where('message.assistence_sessions_id = :sessionId', { sessionId });

    // Apply additional filters
    this.applyFilters(queryBuilder, filters);

    // Select only basic fields for performance
    queryBuilder.select(['message.id', 'message.sender', 'message.message', 'message.message_type', 'message.created_at']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`message.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('message.created_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: messages.map(message => ({
        id: message.id,
        sender: message.sender,
        message: message.message,
        message_type: message.message_type,
        created_at: message.created_at,
      })),
      meta,
    };
  }

  /**
   * Retrieve messages by question ID and user ID with pagination
   * User-friendly endpoint that automatically finds the session
   */
  async findByQuestionAndUser(questionId: number, userInfo: UserBasicInfo, query: Omit<AiAssistanceMessageQuery, 'assistence_sessions_id'>): Promise<AiAssistanceMessageListResponse> {
    // Find the session for this question and user
    const session = await this.aiAssistanceSessionService.findByQuestionAndUser(questionId, userInfo.id);

    if (!session) {
      // Return empty result if no session exists (no messages yet)
      return {
        data: [],
        meta: createPaginationMeta(0, query.page || 1, query.limit || 10),
      };
    }

    // Use existing findBySessionId method
    return this.findBySessionId(session.id, query);
  }

  /**
   * Count total AI assistance messages with optional filtering
   * Filters by user unless user is admin
   */
  async count(filters?: AiAssistanceMessageFilter, userInfo?: { user_id: number; isAdmin?: boolean }): Promise<AiAssistanceMessageCountResponse> {
    const queryBuilder = this.createBaseQueryBuilder(filters || {}, userInfo);
    const count = await queryBuilder.getCount();

    return {
      data: { count },
    };
  }

  /**
   * Check if an AI assistance message exists by ID
   * Checks user ownership unless user is admin
   */
  async exists(id: number, userInfo?: { user_id: number; isAdmin?: boolean }): Promise<AiAssistanceMessageExistsResponse> {
    const queryBuilder = this.aiAssistanceMessagesRepository.createQueryBuilder('message').where('message.id = :id', { id });

    // If user is not admin, check ownership through session
    if (userInfo && !userInfo.isAdmin) {
      queryBuilder.leftJoin('message.assistanceSession', 'session').andWhere('session.user_id = :userId', { userId: userInfo.user_id });
    }

    const count = await queryBuilder.getCount();

    return {
      data: { exists: count > 0 },
    };
  }

  /**
   * Create base query builder with common configurations
   * Optimized for reuse across different methods
   * Includes user filtering when not admin
   */
  private createBaseQueryBuilder(filters: AiAssistanceMessageFilter, userInfo?: { user_id: number; isAdmin?: boolean }): SelectQueryBuilder<AiAssistanceMessage> {
    const queryBuilder = this.aiAssistanceMessagesRepository.createQueryBuilder('message');

    // If user is not admin, filter by user ownership through sessions
    if (userInfo && !userInfo.isAdmin) {
      queryBuilder.leftJoin('message.assistanceSession', 'session').andWhere('session.user_id = :userId', { userId: userInfo.user_id });
    }

    this.applyFilters(queryBuilder, filters);

    return queryBuilder;
  }

  /**
   * Apply filtering conditions to query builder
   * Centralized filtering logic for consistency
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<AiAssistanceMessage>, filters: AiAssistanceMessageFilter): void {
    if (filters.assistence_sessions_id !== undefined) {
      queryBuilder.andWhere('message.assistence_sessions_id = :sessionId', {
        sessionId: filters.assistence_sessions_id,
      });
    }

    if (filters.sender) {
      queryBuilder.andWhere('message.sender = :sender', { sender: filters.sender });
    }

    if (filters.message_type) {
      queryBuilder.andWhere('message.message_type = :messageType', {
        messageType: filters.message_type,
      });
    }
  }
}
