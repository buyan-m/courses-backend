import { Module } from '@nestjs/common'
import { authProvider, tokenProvider } from './auth.db.provider'
import { coursesProvider } from './course.db.provider'
import { lessonProvider } from './lesson.db.provider'
import { pagesProvider } from './page.db.provider'
import { userProvider } from './user.db.provider'
import { grantProvider } from './grant.db.provider'
import { progressProvider } from './progress.db.provider'
import { roleProvider } from './role.db.provider'
import { databaseProvider } from './connection.db.provider'
import { teacherProvider } from './teacher.db.provider'
import { studentProvider } from './student.db.provider'
import { answerProvider } from './answer.db.provider'

@Module({
    exports: [
        coursesProvider,
        lessonProvider,
        pagesProvider,
        userProvider,
        grantProvider,
        authProvider,
        tokenProvider,
        roleProvider,
        progressProvider,
        teacherProvider,
        studentProvider,
        answerProvider
    ],
    providers: [
        databaseProvider,
        coursesProvider,
        lessonProvider,
        pagesProvider,
        userProvider,
        grantProvider,
        authProvider,
        tokenProvider,
        roleProvider,
        progressProvider,
        teacherProvider,
        studentProvider,
        answerProvider
    ]
})
export class DBModule {}
