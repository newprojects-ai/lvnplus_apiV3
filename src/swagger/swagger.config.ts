import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('LVNPlus API')
  .setDescription('API documentation for LVNPlus learning platform')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'bearerAuth',
  )
  .addTag('Students', 'Student management endpoints')
  .addTag('Groups', 'Study group management endpoints')
  .addTag('Test Plans', 'Test planning and management endpoints')
  .addTag('Test Executions', 'Test execution and results endpoints')
  .addTag('Parents', 'Parent-specific endpoints')
  .build();
