import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiAssistanceSession } from './ai_assistance_session.entity';
import { AiAssistanceMessage as AiAssistanceMessageType } from '../modules/ai_assistance_message/schemas/ai_assistance_message.schema';

export enum SenderEnum {
  USER = 'user',
  IA = 'ia',
}

export enum MessageTypeEnum {
  CLARIFICATION_REQUEST = 'clarification_request',
  CLARIFICATION_RESPONSE = 'clarification_response',
  CORRECTION_SUGGESTION = 'correction_suggestion',
  CORRECTION_CONFIRMATION = 'correction_confirmation',
  OTHER = 'other',
}

@Entity('ai_assistance_messages')
export class AiAssistanceMessage implements AiAssistanceMessageType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assistence_sessions_id', type: 'uuid' })
  assistence_sessions_id: string;

  @Column({
    type: 'enum',
    enum: SenderEnum,
  })
  sender: SenderEnum;

  @Column({ type: 'text' })
  message: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageTypeEnum,
  })
  message_type: MessageTypeEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  // Relationship
  @ManyToOne(() => AiAssistanceSession)
  @JoinColumn({ name: 'assistence_sessions_id' })
  assistanceSession: AiAssistanceSession;
}
