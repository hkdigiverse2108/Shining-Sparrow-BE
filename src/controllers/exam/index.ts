import { apiResponse } from "../../common";
import { examModel, questionModel, userExamAttemptModel } from "../../database";
import { countData, createData, findAllWithPopulate, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { addExamSchema, editExamSchema, deleteExamSchema, getExamSchema, submitExamSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_exam = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addExamSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let allQuestionIds: any[] = []

        // Link existing questions
        if (value.questionIds && value.questionIds.length > 0) {
            allQuestionIds = value.questionIds.map(id => new ObjectId(id))
        }

        // Create new questions inline and auto-link
        if (value.newQuestions && value.newQuestions.length > 0) {
            for (const q of value.newQuestions) {
                q.courseId = new ObjectId(value.courseId)
                const newQuestion = await createData(questionModel, q)
                if (newQuestion) {
                    allQuestionIds.push(newQuestion._id)
                }
            }
        }

        const examData = {
            courseId: new ObjectId(value.courseId),
            courseLessonId: new ObjectId(value.courseLessonId),
            title: value.title,
            description: value.description,
            questionIds: allQuestionIds,
            passingMarks: value.passingMarks,
            totalMarks: value.totalMarks,
            timeLimit: value.timeLimit,
        }

        const response = await createData(examModel, examData);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("exam"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_exam_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editExamSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let updateObj: any = { ...value }
        let allQuestionIds: any[] = []

        // Link existing questions
        if (value.questionIds && value.questionIds.length > 0) {
            allQuestionIds = value.questionIds.map(id => new ObjectId(id))
        }

        // Create new questions inline and auto-link
        if (value.newQuestions && value.newQuestions.length > 0) {
            const exam = await getFirstMatch(examModel, { _id: new ObjectId(value.examId), isDeleted: false }, {}, {})
            const courseId = value.courseId ? new ObjectId(value.courseId) : exam?.courseId

            for (const q of value.newQuestions) {
                q.courseId = courseId
                const newQuestion = await createData(questionModel, q)
                if (newQuestion) {
                    allQuestionIds.push(newQuestion._id)
                }
            }
        }

        if (allQuestionIds.length > 0) {
            updateObj.questionIds = allQuestionIds
        }

        if (updateObj.courseId) updateObj.courseId = new ObjectId(updateObj.courseId)
        if (updateObj.courseLessonId) updateObj.courseLessonId = new ObjectId(updateObj.courseLessonId)
        delete updateObj.newQuestions

        const response = await updateData(examModel, { _id: new ObjectId(value.examId), isDeleted: false }, updateObj, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("exam"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("exam"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_exam_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteExamSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(examModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("exam"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("exam"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_exams = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, courseId, courseLessonId } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { title: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } },
            ]
        }
        if (courseId) {
            criteria.courseId = new ObjectId(courseId)
        }
        if (courseLessonId) {
            criteria.courseLessonId = new ObjectId(courseLessonId)
        }
        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = [
            { path: 'courseId', select: 'name' },
            { path: 'courseLessonId', select: 'title subtitle priority' },
            { path: 'questionIds', match: { isDeleted: false }, options: { sort: { priority: 1 } } },
        ];
        const response = await findAllWithPopulate(examModel, criteria, {}, options, populateModel)
        const totalCount = await countData(examModel, criteria)
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('exams'), {
            exam_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_exam_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getExamSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const populateModel = [
            { path: 'courseId', select: 'name' },
            { path: 'courseLessonId', select: 'title subtitle priority' },
            { path: 'questionIds', match: { isDeleted: false }, options: { sort: { priority: 1 } } },
        ];
        const response = await examModel.findOne({ _id: new ObjectId(value.id), isDeleted: false }).populate(populateModel).lean()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("exam"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("exam"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const submit_exam = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = submitExamSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        // Fetch the exam with its questions
        const exam = await examModel.findOne({ _id: new ObjectId(value.examId), isDeleted: false })
            .populate({ path: 'questionIds', match: { isDeleted: false } }).lean() as any
        if (!exam) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("exam"), {}, {}))

        // Build a map of questionId -> question for quick lookup
        const questionMap = new Map()
        for (const q of exam.questionIds) {
            questionMap.set(q._id.toString(), q)
        }

        // Grade the answers
        let obtainedMarks = 0
        const gradedAnswers: any[] = []

        for (const ans of value.answers) {
            const question = questionMap.get(ans.questionId)
            if (!question) continue

            const isCorrect = question.correctAnswer.trim().toLowerCase() === (ans.answer || '').trim().toLowerCase()
            if (isCorrect) {
                obtainedMarks += question.score || 1
            }

            gradedAnswers.push({
                questionId: new ObjectId(ans.questionId),
                answer: ans.answer,
                isCorrect,
            })
        }

        const status = obtainedMarks >= exam.passingMarks ? 'pass' : 'fail'

        // Upsert: update existing attempt or create new one
        const attemptData = {
            userId: new ObjectId(userId),
            examId: new ObjectId(value.examId),
            courseId: exam.courseId,
            courseLessonId: exam.courseLessonId,
            answers: gradedAnswers,
            obtainedMarks,
            totalMarks: exam.totalMarks,
            timeTaken: value.timeTaken,
            status,
            isCompleted: true,
        }

        const existingAttempt = await getFirstMatch(userExamAttemptModel, {
            userId: new ObjectId(userId),
            examId: new ObjectId(value.examId),
        }, {}, {})

        let response;
        if (existingAttempt) {
            // Update existing attempt, increment attemptCount
            response = await updateData(userExamAttemptModel, {
                userId: new ObjectId(userId),
                examId: new ObjectId(value.examId),
            }, {
                ...attemptData,
                $inc: { attemptCount: 1 },
            }, { new: true })
        } else {
            // Create first attempt
            response = await createData(userExamAttemptModel, {
                ...attemptData,
                attemptCount: 1,
            })
        }

        return res.status(200).json(new apiResponse(200, `Exam submitted successfully! Status: ${status}`, response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_user_attempts = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        const { page, limit, courseId, examId } = req.query
        let criteria: any = { userId: new ObjectId(userId) }, options: any = { lean: true }

        if (courseId) {
            criteria.courseId = new ObjectId(courseId)
        }
        if (examId) {
            criteria.examId = new ObjectId(examId)
        }
        options.sort = { updatedAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = [
            { path: 'examId', select: 'title description passingMarks totalMarks timeLimit' },
            { path: 'courseLessonId', select: 'title subtitle' },
            { path: 'courseId', select: 'name' },
        ];
        const response = await findAllWithPopulate(userExamAttemptModel, criteria, {}, options, populateModel)
        const totalCount = await countData(userExamAttemptModel, criteria)
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('exam attempts'), {
            attempt_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}
