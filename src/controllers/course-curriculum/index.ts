import { apiResponse } from "../../common";
import { courseCurriculumModel, examModel, userExamAttemptModel } from "../../database";
import { countData, createData, getData, reqInfo, responseMessage, updateData } from "../../helper";
import { addCourseCurriculumSchema, editCourseCurriculumSchema, deleteCourseCurriculumSchema, getCourseCurriculumSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_course_curriculum = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addCourseCurriculumSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        if (value.courseId) value.courseId = new ObjectId(value.courseId)
        if (value.courseLessonId) value.courseLessonId = new ObjectId(value.courseLessonId)
        if (value.courseLessonsAssigned) {
            value.courseLessonsAssigned = value.courseLessonsAssigned.map(id => new ObjectId(id))
        }

        const response = await createData(courseCurriculumModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("course curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_course_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editCourseCurriculumSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        if (value.courseId) value.courseId = new ObjectId(value.courseId)
        if (value.courseLessonId) value.courseLessonId = new ObjectId(value.courseLessonId)
        if (value.courseLessonsAssigned) {
            value.courseLessonsAssigned = value.courseLessonsAssigned.map(id => new ObjectId(id))
        }

        const response = await updateData(courseCurriculumModel, { _id: new ObjectId(value.courseCurriculumId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("course curriculum"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("course curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_course_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteCourseCurriculumSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(courseCurriculumModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course curriculum"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("course curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_course_curriculums = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, courseId, courseLessonId, startDate, endDate } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { title: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } }
            ]
        }
        if (courseId) {
            criteria.courseId = new ObjectId(courseId)
        }
        if (courseLessonId) {
            criteria.courseLessonsAssigned = { $in: [new ObjectId(courseLessonId)] }
        }
        if (startDate && endDate) {
            criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        options.sort = { courseLessonsPriority: 1, createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = [
            { path: 'courseId', select: 'name description' },
            { path: 'courseLessonsAssigned', select: 'title subtitle priority practiceMaterial lessonLock' }
        ];
        const response = await courseCurriculumModel.find(criteria, {}, options).populate(populateModel).lean()
        const totalCount = await countData(courseCurriculumModel, criteria)

        // Compute lesson unlock status for each curriculum's lessons
        const userId = req.headers.user?._id || null
        let enrichedResponse = response

        if (userId) {
            enrichedResponse = []
            for (const curriculum of response) {
                if (curriculum.courseLessonsAssigned && curriculum.courseLessonsAssigned.length > 0) {
                    const lessons = [...curriculum.courseLessonsAssigned].sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
                    const lessonIds = lessons.map((l: any) => l._id)

                    const exams = await getData(examModel, { courseLessonId: { $in: lessonIds }, isDeleted: false }, {}, {})
                    const examIds = exams.map(e => e._id)
                    const attempts = examIds.length > 0
                        ? await getData(userExamAttemptModel, { userId: new ObjectId(userId), examId: { $in: examIds }, isCompleted: true }, {}, {})
                        : []

                    const examByLessonId = new Map()
                    for (const exam of exams) examByLessonId.set(exam.courseLessonId.toString(), exam)
                    const attemptByExamId = new Map()
                    for (const attempt of attempts) attemptByExamId.set(attempt.examId.toString(), attempt)

                    const lessonsWithUnlock = lessons.map((lesson: any, i: number) => {
                        let isUnlocked = false
                        if (i === 0) {
                            isUnlocked = true
                        } else {
                            const prevExam = examByLessonId.get(lessons[i - 1]._id.toString())
                            if (!prevExam) {
                                isUnlocked = true
                            } else {
                                const prevAttempt = attemptByExamId.get(prevExam._id.toString())
                                isUnlocked = prevAttempt?.status === 'pass'
                            }
                        }
                        return { ...lesson, isUnlocked }
                    })

                    enrichedResponse.push({ ...curriculum, courseLessonsAssigned: lessonsWithUnlock })
                } else {
                    enrichedResponse.push(curriculum)
                }
            }
        }

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('course curriculums'), { course_curriculum_data: enrichedResponse, totalData: totalCount, state: stateObj }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_course_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getCourseCurriculumSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const populateModel = [
            { path: 'courseId', select: 'name description' },
            { path: 'courseLessonId', select: 'title subtitle' },
            { path: 'courseLessonsAssigned', select: 'title subtitle priority practiceMaterial' }
        ];
        const response: any = await courseCurriculumModel.findById(value.id).populate(populateModel).lean()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course curriculum"), {}, {}))

        // Compute lesson unlock status
        const userId = req.headers.user?._id || null
        if (userId && response.courseLessonsAssigned && response.courseLessonsAssigned.length > 0) {
            const lessons = [...response.courseLessonsAssigned].sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
            const lessonIds = lessons.map((l: any) => l._id)

            const exams = await getData(examModel, { courseLessonId: { $in: lessonIds }, isDeleted: false }, {}, {})
            const examIds = exams.map(e => e._id)
            const attempts = examIds.length > 0
                ? await getData(userExamAttemptModel, { userId: new ObjectId(userId), examId: { $in: examIds }, isCompleted: true }, {}, {})
                : []

            const examByLessonId = new Map()
            for (const exam of exams) examByLessonId.set(exam.courseLessonId.toString(), exam)
            const attemptByExamId = new Map()
            for (const attempt of attempts) attemptByExamId.set(attempt.examId.toString(), attempt)

            response.courseLessonsAssigned = lessons.map((lesson: any, i: number) => {
                let isUnlocked = false
                if (i === 0) {
                    isUnlocked = true
                } else {
                    const prevExam = examByLessonId.get(lessons[i - 1]._id.toString())
                    if (!prevExam) {
                        isUnlocked = true
                    } else {
                        const prevAttempt = attemptByExamId.get(prevExam._id.toString())
                        isUnlocked = prevAttempt?.status === 'pass'
                    }
                }
                return { ...lesson, isUnlocked }
            })
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

