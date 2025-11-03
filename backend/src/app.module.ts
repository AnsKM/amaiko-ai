import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsModule } from './agents/agents.module';
import { GraphModule } from './graph/graph.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl =
          config.get<string>('DATABASE_URL') ??
          config.get<string>('TEST_DATABASE_URL');

        if (!databaseUrl) {
          throw new Error(
            'DATABASE_URL or TEST_DATABASE_URL must be defined for the backend service.',
          );
        }

        const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: nodeEnv !== 'production',
          ssl:
            nodeEnv === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),
    GraphModule,
    McpModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
