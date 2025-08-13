import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '@/entities/subject.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { SubjectSummary, SubjectDetails, SubjectCreate, SubjectUpdate, SubjectIdentity } from './schemas/subject.schema';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(SkillCategory)
    private readonly skillCategoryRepository: Repository<SkillCategory>
  ) {}

  /**
   * Transform a subject entity to include skill category data
   */
  private transformSubjectWithSkillCategory(subject: Subject & { skill_category?: SkillCategory }): any {
    return {
      ...subject,
      name: subject.skill_category?.name || '',
      slug: subject.skill_category?.slug || '',
      description: subject.skill_category?.description || '',
    };
  }

  /**
   * Find all subjects with skill category data
   */
  async findAll(): Promise<SubjectSummary[]> {
    const subjects = await this.subjectRepository.find({
      relations: ['skill_category', 'contest'],
      where: { is_active: true },
      order: { display_order: 'ASC' },
    });

    return subjects.map(subject => this.transformSubjectWithSkillCategory(subject));
  }

  /**
   * Find subjects by contest ID with skill category data
   */
  async findByContestId(contestId: number): Promise<SubjectSummary[]> {
    const subjects = await this.subjectRepository.find({
      relations: ['skill_category', 'contest'],
      where: { contest_id: contestId, is_active: true },
      order: { display_order: 'ASC' },
    });

    return subjects.map(subject => this.transformSubjectWithSkillCategory(subject));
  }

  /**
   * Find a subject by ID with skill category data
   */
  async findById(id: number): Promise<SubjectDetails | null> {
    const subject = await this.subjectRepository.findOne({
      relations: ['skill_category', 'contest'],
      where: { id },
    });

    if (!subject) {
      return null;
    }

    return this.transformSubjectWithSkillCategory(subject);
  }

  /**
   * Find a subject by slug (using skill category slug)
   */
  async findBySlug(slug: string): Promise<SubjectDetails | null> {
    const subject = await this.subjectRepository.createQueryBuilder('subject').leftJoinAndSelect('subject.skill_category', 'skill_category').leftJoinAndSelect('subject.contest', 'contest').where('skill_category.slug = :slug', { slug }).getOne();

    if (!subject) {
      return null;
    }

    return this.transformSubjectWithSkillCategory(subject);
  }

  /**
   * Create a new subject
   */
  async create(createData: SubjectCreate): Promise<SubjectDetails> {
    const subject = this.subjectRepository.create(createData);
    const savedSubject = await this.subjectRepository.save(subject);

    // Fetch the complete subject with relations
    const completeSubject = await this.findById(savedSubject.id);
    return completeSubject!;
  }

  /**
   * Update a subject
   */
  async update(id: number, updateData: SubjectUpdate): Promise<SubjectDetails | null> {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      return null;
    }

    await this.subjectRepository.update(id, updateData);

    // Fetch the updated subject with relations
    const updatedSubject = await this.findById(id);
    return updatedSubject;
  }

  /**
   * Delete a subject (soft delete by setting is_active to false)
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.subjectRepository.update(id, { is_active: false });
    return result.affected! > 0;
  }

  /**
   * Get subject identity (for references in other modules)
   */
  async getSubjectIdentity(id: number): Promise<SubjectIdentity | null> {
    const subject = await this.subjectRepository.findOne({
      relations: ['skill_category'],
      where: { id },
    });

    if (!subject) {
      return null;
    }

    return {
      id: subject.id,
      skill_category_id: subject.skill_category_id,
      name: subject.skill_category?.name || '',
      slug: subject.skill_category?.slug || '',
    };
  }
}
