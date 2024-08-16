import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.modules';
import { MainAppModule } from './modules/main-app.modules';

@Module({
  imports: [CoreModule, MainAppModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
