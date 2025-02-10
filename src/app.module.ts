import { Module } from '@nestjs/common';
import { TutorController } from './controllers/tutor.controller';
import { ParentController } from './controllers/parent.controller';
import { TutorService } from './services/tutor.service';
import { ParentService } from './services/parent.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule,
  ],
  controllers: [TutorController, ParentController],
  providers: [TutorService, ParentService],
})
export class AppModule {}
