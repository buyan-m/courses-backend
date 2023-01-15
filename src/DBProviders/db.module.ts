import { Module } from '@nestjs/common'
import { authProvider, tokenProvider } from './auth.db.provider'
import { coursesProvider } from './course.db.provider'
import { lessonProvider } from './lesson.db.provider'
import { pagesProvider } from './page.db.provider'
import { userProvider } from './user.db.provider'
import { grantProvider } from './grant.db.provider'
import { databaseProvider } from './connection.db.provider'

@Module({
    exports: [
        coursesProvider,
        lessonProvider,
        pagesProvider,
        userProvider,
        grantProvider,
        authProvider,
        tokenProvider
    ],
    providers: [
        databaseProvider,
        coursesProvider,
        lessonProvider,
        pagesProvider,
        userProvider,
        grantProvider,
        authProvider,
        tokenProvider
    ]
})
export class DBModule {}
