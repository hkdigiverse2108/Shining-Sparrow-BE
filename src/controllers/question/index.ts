import { apiResponse, USER_ROLES } from "../../common";
import { questionModel } from "../../database";
import { countData, createData, findAllWithPopulate, reqInfo, responseMessage, updateData } from "../../helper";
import { addQuestionSchema, editQuestionSchema, deleteQuestionSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_question = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addQuestionSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        if (value.courseId) value.courseId = new ObjectId(value.courseId)

        const response = await createData(questionModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("question"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_question_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editQuestionSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        if (value.courseId) value.courseId = new ObjectId(value.courseId)

        const response = await updateData(questionModel, { _id: new ObjectId(value.questionId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("question"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("question"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_question_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteQuestionSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(questionModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("question"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("question"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_questions = async (req, res) => {
    reqInfo(req)
    try {
        const user = req.headers.user
        const isAdmin = user && user.role === USER_ROLES.ADMIN;
        const { page, limit, search, courseId, questionType } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (!isAdmin) {
            criteria.isBlocked = false;
        }

        if (search) {
            criteria.$or = [
                { questionText: { $regex: search, $options: 'si' } },
            ]
        }
        if (courseId) {
            criteria.courseId = new ObjectId(courseId)
        }
        if (questionType) {
            criteria.questionType = questionType
        }
        options.sort = { priority: 1, createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = { path: 'courseId', select: 'name' };
        const response = await findAllWithPopulate(questionModel, criteria, {}, options, populateModel)
        const totalCount = await countData(questionModel, criteria)
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('questions'), {
            question_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}
