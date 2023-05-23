import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

const DEV_MODE = process.env.APP_MODE === 'dev'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())
    if (DEV_MODE) {
        const config = new DocumentBuilder()
            .setTitle('Okul.one gateway API')
            .setDescription('description')
            .setVersion('0.0')
            .build()

        const document = SwaggerModule.createDocument(app, config)
        SwaggerModule.setup('swagger', app, document)
    }
    await app.listen(3000)
}
bootstrap()
