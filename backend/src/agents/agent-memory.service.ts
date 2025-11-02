import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentMapping } from './entities/agent-mapping.entity';

export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  department?: string;
}

/**
 * Service to manage agent-to-user mappings and metadata
 */
@Injectable()
export class AgentMemoryService {
  private readonly logger = new Logger(AgentMemoryService.name);

  constructor(
    @InjectRepository(AgentMapping)
    private agentMappingRepository: Repository<AgentMapping>,
  ) {}

  /**
   * Save agent mapping for a user
   */
  async saveAgentMapping(
    userId: string,
    agentId: string,
    userProfile?: UserProfile,
  ): Promise<AgentMapping> {
    try {
      // Check if mapping already exists
      let mapping = await this.agentMappingRepository.findOne({
        where: { userId },
      });

      if (mapping) {
        // Update existing mapping
        mapping.agentId = agentId;
        mapping.isActive = true;
        if (userProfile) {
          mapping.userEmail = userProfile.email;
          mapping.userName = userProfile.name;
          mapping.metadata = {
            ...mapping.metadata,
            role: userProfile.role,
            department: userProfile.department,
          };
        }
      } else {
        // Create new mapping
        mapping = this.agentMappingRepository.create({
          userId,
          agentId,
          userEmail: userProfile?.email,
          userName: userProfile?.name,
          metadata: {
            role: userProfile?.role,
            department: userProfile?.department,
          },
          isActive: true,
        });
      }

      await this.agentMappingRepository.save(mapping);

      this.logger.log(`Agent mapping saved for user ${userId}`);
      return mapping;
    } catch (error) {
      this.logger.error('Error saving agent mapping', error);
      throw error;
    }
  }

  /**
   * Get agent ID for a user
   */
  async getAgentId(userId: string): Promise<string | null> {
    try {
      const mapping = await this.agentMappingRepository.findOne({
        where: { userId, isActive: true },
      });

      return mapping?.agentId || null;
    } catch (error) {
      this.logger.error('Error getting agent ID', error);
      throw error;
    }
  }

  /**
   * Get agent mapping for a user
   */
  async getAgentMapping(userId: string): Promise<AgentMapping> {
    try {
      const mapping = await this.agentMappingRepository.findOne({
        where: { userId, isActive: true },
      });

      if (!mapping) {
        throw new NotFoundException(`No agent mapping found for user ${userId}`);
      }

      return mapping;
    } catch (error) {
      this.logger.error('Error getting agent mapping', error);
      throw error;
    }
  }

  /**
   * Update agent metadata
   */
  async updateAgentMetadata(
    userId: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const mapping = await this.getAgentMapping(userId);

      mapping.metadata = {
        ...mapping.metadata,
        ...metadata,
      };

      await this.agentMappingRepository.save(mapping);

      this.logger.log(`Agent metadata updated for user ${userId}`);
    } catch (error) {
      this.logger.error('Error updating agent metadata', error);
      throw error;
    }
  }

  /**
   * Deactivate agent for a user
   */
  async deactivateAgent(userId: string): Promise<void> {
    try {
      const mapping = await this.getAgentMapping(userId);

      mapping.isActive = false;
      await this.agentMappingRepository.save(mapping);

      this.logger.log(`Agent deactivated for user ${userId}`);
    } catch (error) {
      this.logger.error('Error deactivating agent', error);
      throw error;
    }
  }

  /**
   * Get all active agent mappings
   */
  async getAllActiveMappings(): Promise<AgentMapping[]> {
    try {
      return await this.agentMappingRepository.find({
        where: { isActive: true },
      });
    } catch (error) {
      this.logger.error('Error getting all active mappings', error);
      throw error;
    }
  }

  /**
   * Check if user has an active agent
   */
  async hasActiveAgent(userId: string): Promise<boolean> {
    try {
      const count = await this.agentMappingRepository.count({
        where: { userId, isActive: true },
      });

      return count > 0;
    } catch (error) {
      this.logger.error('Error checking active agent', error);
      throw error;
    }
  }
}
