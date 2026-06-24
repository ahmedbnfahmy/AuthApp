import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  if (dataSource.options.type === 'postgres') {
    const { database, host, port } = dataSource.options;
    Logger.log(
      `Database connected successfully (${database}@${host}:${port})`,
      'TypeORM',
    );
  }
  Logger.log('Server is running on port 3000');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
