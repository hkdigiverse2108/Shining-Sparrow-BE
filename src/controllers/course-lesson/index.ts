import { apiResponse, USER_ROLES } from "../../common";
import { courseLessonModel, courseModel, examModel, userCourseModel, userExamAttemptModel, userModel, userLessonCompletionModel } from "../../database";
import { countData, createData, findAllWithPopulate, getData, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { addCourseLessonSchema, editCourseLessonSchema, deleteCourseLessonSchema, getCourseLessonSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Helper: compute isUnlocked for each lesson in a sorted array.
 * Lesson unlock logic:
 *   - First lesson (lowest priority) → always unlocked
 *   - For subsequent lessons: check if previous lesson's exam was passed
 *   - If previous lesson has no exam → next lesson is unlocked
 */
export const computeLessonUnlockStatus = async (lessons: any[], userId: string | null, courseCurriculumIds?: any[]) => {
    if (!userId || lessons.length === 0) {
        return lessons.map((lesson, index) => ({
            ...lesson,
            isUnlocked: index === 0,
            isCompleted: false,
        }))
    }

    // Sort by course index (if merged course) then by priority ascending
    const courseOrder = courseCurriculumIds || []
    const sorted = [...lessons].sort((a, b) => {
        if (courseOrder.length > 0) {
            const indexA = courseOrder.findIndex(id => id.toString() === a.courseId?.toString())
            const indexB = courseOrder.findIndex(id => id.toString() === b.courseId?.toString())
            if (indexA !== indexB) {
                return indexA - indexB
            }
        }
        return (a.priority || 0) - (b.priority || 0)
    })

    // Get all exams for these lessons in one query
    const lessonIds = sorted.map(l => l._id)
    const exams = await getData(examModel, {
        courseLessonId: { $in: lessonIds },
        isDeleted: false,
    }, {}, {})

    // Get all attempts by this user for these exams
    const examIds = exams.map(e => e._id)
    const attempts = examIds.length > 0
        ? await getData(userExamAttemptModel, {
            userId: new ObjectId(userId),
            examId: { $in: examIds },
            isCompleted: true,
        }, {}, {})
        : []

    // Get all manual completion records by this user for these lessons
    const completions = userId
        ? await getData(userLessonCompletionModel, {
            userId: new ObjectId(userId),
            courseLessonId: { $in: lessonIds }
        }, {}, {})
        : []
    const completedLessonIds = new Set(completions.map(c => c.courseLessonId.toString()));

    // Build maps for quick lookup
    const examsByLessonId = new Map<string, any[]>()
    for (const exam of exams) {
        const key = exam.courseLessonId.toString()
        if (!examsByLessonId.has(key)) {
            examsByLessonId.set(key, [])
        }
        examsByLessonId.get(key)!.push(exam)
    }

    // Sort exams for each lesson by priority ascending
    for (const [lessonId, lessonExams] of examsByLessonId.entries()) {
        lessonExams.sort((a, b) => (a.priority || 0) - (b.priority || 0))
    }

    const attemptByExamId = new Map()
    for (const attempt of attempts) {
        attemptByExamId.set(attempt.examId.toString(), attempt)
    }

    const result: any[] = []
    for (let i = 0; i < sorted.length; i++) {
        const lesson = sorted[i]
        let isUnlocked = false

        if (i === 0) {
            // First lesson always unlocked
            isUnlocked = true
        } else {
            // Check previous lesson
            const prevLesson = result[i - 1]
            if (!prevLesson.isUnlocked) {
                // If previous lesson is locked, this lesson is also locked
                isUnlocked = false
            } else {
                // Check previous lesson's primary exam
                const prevExams = examsByLessonId.get(prevLesson._id.toString()) || []
                if (prevExams.length === 0) {
                    // No exam for previous lesson → this lesson is unlocked
                    isUnlocked = true
                } else {
                    const prevExam = prevExams[0]
                    const prevAttempt = attemptByExamId.get(prevExam._id.toString())
                    isUnlocked = prevAttempt?.status === 'pass'
                }
            }
        }

        const currentExams = examsByLessonId.get(lesson._id.toString()) || []
        const primaryExam = currentExams[0]
        const examId = primaryExam ? primaryExam._id : null
        const examIds = currentExams.map(e => e._id)

        let isCompleted = false
        if (currentExams.length > 0) {
            const attempt = attemptByExamId.get(primaryExam._id.toString())
            isCompleted = attempt?.status === 'pass'
        } else {
            isCompleted = completedLessonIds.has(lesson._id.toString())
        }

        result.push({ ...lesson, isUnlocked, examId, examIds, exams: currentExams, isCompleted })
    }

    return result
}

export const getLessonIdsForCourse = async (courseId: any): Promise<any[]> => {
    const course = await courseModel.findOne({ _id: new ObjectId(courseId), isDeleted: false }).lean();
    if (!course) return [];

    if (course.courseCurriculumIds && course.courseCurriculumIds.length > 0) {
        let allLessonIds: any[] = [];
        for (const subCourseId of course.courseCurriculumIds) {
            const subLessonIds = await getLessonIdsForCourse(subCourseId);
            allLessonIds = allLessonIds.concat(subLessonIds);
        }
        return Array.from(new Set(allLessonIds.map(id => id.toString()))).map(id => new ObjectId(id));
    }

    if (course.courseLessonIds && course.courseLessonIds.length > 0) {
        return course.courseLessonIds;
    }

    // Fallback: lessons pointing to courseId
    const lessons = await courseLessonModel.find({ courseId: new ObjectId(courseId), isDeleted: false }).lean();
    return lessons.map(l => l._id);
};

export const add_course_lesson = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addCourseLessonSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await createData(courseLessonModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))

        if (value.courseId) {
            await updateData(courseModel, { _id: new ObjectId(value.courseId), isDeleted: false }, { $push: { courseLessonIds: response._id } }, { new: true, timestamps: false })
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("course lesson"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_course_lesson_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editCourseLessonSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const lesson = await getFirstMatch(courseLessonModel, { _id: new ObjectId(value.courseLessonId), isDeleted: false }, {}, {});
        if (!lesson) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course lesson"), {}, {}))

        const oldCourseId = lesson.courseId;
        const newCourseId = value.courseId;

        const response = await updateData(courseLessonModel, { _id: new ObjectId(value.courseLessonId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("course lesson"), {}, {}))

        // If the lesson's courseId was updated, synchronize both courses' lesson ID lists to prevent leakage
        if (newCourseId && oldCourseId && oldCourseId.toString() !== newCourseId.toString()) {
            await updateData(courseModel, { _id: oldCourseId, isDeleted: false }, { $pull: { courseLessonIds: response._id } }, { new: true, timestamps: false })
            await updateData(courseModel, { _id: new ObjectId(newCourseId), isDeleted: false }, { $push: { courseLessonIds: response._id } }, { new: true, timestamps: false })
        } else if (newCourseId && !oldCourseId) {
            await updateData(courseModel, { _id: new ObjectId(newCourseId), isDeleted: false }, { $push: { courseLessonIds: response._id } }, { new: true, timestamps: false })
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("course lesson"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_course_lesson_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteCourseLessonSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(courseLessonModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course lesson"), {}, {}))

        if (response.courseId) {
            await updateData(courseModel, { _id: response.courseId, isDeleted: false }, { $pull: { courseLessonIds: response._id } }, { new: true, timestamps: false })
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("course lesson"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_course_lessons = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, courseId, startDate, endDate } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { title: { $regex: search, $options: 'si' } },
                { subtitle: { $regex: search, $options: 'si' } }
            ]
        }
        let courseCurriculumIds: any[] = []
        if (courseId) {
            const course = await getFirstMatch(courseModel, { _id: new ObjectId(courseId), isDeleted: false }, {}, {})
            if (course) {
                const lessonIds = await getLessonIdsForCourse(courseId)
                criteria._id = { $in: lessonIds }
                courseCurriculumIds = course.courseCurriculumIds || []
            } else {
                criteria.courseId = new ObjectId(courseId)
            }
        }
        if (startDate && endDate) {
            criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        options.sort = { priority: 1, createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = { path: 'courseId', select: 'name description' };
        const response = await findAllWithPopulate(courseLessonModel, criteria, {}, options, populateModel)
        const totalCount = await countData(courseLessonModel, criteria)

        // Compute unlock status for each lesson
        const userId = req.headers.user?._id || null
        const lessonsWithUnlock = await computeLessonUnlockStatus(response, userId, courseCurriculumIds)

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('course lessons'), {
            course_lesson_data: lessonsWithUnlock,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_course_lesson_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getCourseLessonSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const populateModel = { path: 'courseId', select: 'name description' };
        const response = await getFirstMatch(courseLessonModel, { _id: new ObjectId(value.id), isDeleted: false }, {}, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course lesson"), {}, {}))

        // Check if this lesson is locked for the user, and verify access permissions
        const userId = req.headers.user?._id || null
        const userRole = req.headers.user?.role || null
        if (userId && userRole !== USER_ROLES.ADMIN && response.courseId) {
            const user = await getFirstMatch(userModel, { _id: new ObjectId(userId), isDeleted: false }, {}, {})
            if (!user) return res.status(401).json(new apiResponse(401, "User not found", {}, {}))

            const purchasedCourseIds = (user.courseIds || []).map(id => id.toString())

            // Find which purchased courses actually contain this lesson
            const matchingCourses: any[] = [];
            for (const pCourseId of purchasedCourseIds) {
                const lessonIds = await getLessonIdsForCourse(pCourseId);
                if (lessonIds.some(id => id.toString() === value.id)) {
                    matchingCourses.push(pCourseId);
                }
            }

            if (matchingCourses.length === 0) {
                return res.status(403).json(new apiResponse(403, "You have not purchased this course.", {}, {}))
            }

            // Check if access has expired for all matching course purchases
            const now = new Date();
            const activePurchases = await userCourseModel.find({
                userId: new ObjectId(userId),
                courseId: { $in: matchingCourses.map(id => new ObjectId(id)) },
                isDeleted: false,
                $or: [
                    { accessExpiryDate: null },
                    { accessExpiryDate: { $exists: false } },
                    { accessExpiryDate: { $gte: now } }
                ]
            });
            if (activePurchases.length === 0) {
                return res.status(403).json(new apiResponse(403, "Your access to this course has expired. Please renew your purchase.", {}, {}))
            }

            // Check if the lesson is unlocked in at least one of the matching purchased courses
            let isUnlockedInAny = false;
            for (const mCourseId of matchingCourses) {
                const mCourse = await getFirstMatch(courseModel, { _id: new ObjectId(mCourseId), isDeleted: false }, {}, {});
                const courseCurriculumIds = mCourse?.courseCurriculumIds || [];
                const lessonIds = await getLessonIdsForCourse(mCourseId);
                const allLessons = await getData(courseLessonModel, {
                    _id: { $in: lessonIds },
                    isDeleted: false,
                }, {}, { lean: true });

                const lessonsWithUnlock = await computeLessonUnlockStatus(allLessons, userId, courseCurriculumIds);
                const thisLesson = lessonsWithUnlock.find(l => l._id.toString() === value.id);
                if (thisLesson && thisLesson.isUnlocked) {
                    isUnlockedInAny = true;
                    break;
                }
            }

            if (!isUnlockedInAny) {
                return res.status(403).json(new apiResponse(403, "This lesson is locked. Please complete the previous lesson's exam first.", {}, {}))
            }
        }

        const populatedResponse = await courseLessonModel.findById(value.id).populate(populateModel).lean()
        if (!populatedResponse) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course lesson"), {}, {}))

        const exams = await examModel.find({ courseLessonId: new ObjectId(value.id), isDeleted: false }).sort({ priority: 1 }).lean();
        populatedResponse.examId = exams[0] ? exams[0]._id : null;
        populatedResponse.exams = exams;
        populatedResponse.examIds = exams.map(e => e._id);

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course lesson"), populatedResponse, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const complete_lesson = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        const { courseLessonId, courseId } = req.body;
        if (!courseLessonId || !courseId) {
            return res.status(400).json(new apiResponse(400, "courseLessonId and courseId are required", {}, {}))
        }

        // Verify that the lesson exists and is in the course
        const lesson = await getFirstMatch(courseLessonModel, { _id: new ObjectId(courseLessonId), isDeleted: false }, {}, {});
        if (!lesson) {
            return res.status(404).json(new apiResponse(404, "Lesson not found", {}, {}))
        }

        // Check if the user has purchased the course
        const userCourse = await getFirstMatch(userCourseModel, { userId: new ObjectId(userId), courseId: new ObjectId(courseId), isDeleted: false }, {}, {});
        if (!userCourse) {
            return res.status(403).json(new apiResponse(403, "You do not have access to this course", {}, {}))
        }

        // Check if completion record already exists
        const existingCompletion = await getFirstMatch(userLessonCompletionModel, {
            userId: new ObjectId(userId),
            courseLessonId: new ObjectId(courseLessonId)
        }, {}, {});

        if (existingCompletion) {
            return res.status(200).json(new apiResponse(200, "Lesson already marked completed", existingCompletion, {}))
        }

        // Mark it as completed
        const completion = await createData(userLessonCompletionModel, {
            userId: new ObjectId(userId),
            courseId: new ObjectId(courseId),
            courseLessonId: new ObjectId(courseLessonId)
        });

        return res.status(200).json(new apiResponse(200, "Lesson marked completed successfully", completion, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}
