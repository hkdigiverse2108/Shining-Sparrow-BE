import { apiResponse, USER_ROLES } from "../../common";
import { workshopCurriculumModel, userWorkshopCurriculumCompletionModel } from "../../database";
import { countData, createData, findAllWithPopulate, getFirstMatch, reqInfo, responseMessage, updateData, getData } from "../../helper";
import { addWorkshopCurriculumSchema, editWorkshopCurriculumSchema, deleteWorkshopCurriculumSchema, getWorkshopCurriculumSchema, completeWorkshopCurriculumSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_workshop_curriculum = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addWorkshopCurriculumSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await createData(workshopCurriculumModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("workshop curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_workshop_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editWorkshopCurriculumSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await updateData(workshopCurriculumModel, { _id: new ObjectId(value.workshopCurriculumId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("workshop curriculum"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("workshop curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_workshop_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteWorkshopCurriculumSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(workshopCurriculumModel, { _id: new ObjectId(value.id), isDeleted: false }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("workshop curriculum"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("workshop curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_workshop_curriculum = async (req, res) => {
    reqInfo(req)
    try {
        const user = req.headers.user
        const isAdmin = user && user.role === USER_ROLES.ADMIN;
        const { page, limit, search, startDate, endDate, workshopFilter } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (!isAdmin) {
            criteria.isBlocked = false;
        }

        if (search) {
            criteria.$or = [
                { title: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } },
            ]
        }
        if (workshopFilter) {
            criteria.workshopId = new ObjectId(workshopFilter)
        }
        if (startDate && endDate) {
            criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        options.sort = { date: 1, createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        let populateModel = [
            { path: 'workshopId', select: 'title subTitle image price mrpPrice language duration' },
        ]

        const response = await findAllWithPopulate(workshopCurriculumModel, criteria, {}, options, populateModel)
        const totalCount = await countData(workshopCurriculumModel, criteria)

        // If user is authenticated, attach isCompleted to each curriculum item
        let completedIds: string[] = [];
        const userId = user?._id;
        if (userId && !isAdmin && workshopFilter) {
            const completions = await getData(userWorkshopCurriculumCompletionModel, {
                userId: new ObjectId(userId),
                workshopId: new ObjectId(workshopFilter),
            }, {}, { lean: true });
            completedIds = completions.map((c: any) => c.workshopCurriculumId.toString());
        }

        const responseWithCompletion = response.map((item: any) => ({
            ...item,
            isCompleted: completedIds.includes(item._id.toString()),
        }));

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('workshop curriculum'), { 
            workshop_curriculum_data: responseWithCompletion, 
            totalData: totalCount, 
            state: stateObj 
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_workshop_curriculum_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const user = req.headers.user
        const isAdmin = user && user.role === USER_ROLES.ADMIN;
        const { error, value } = getWorkshopCurriculumSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await getFirstMatch(workshopCurriculumModel, { _id: new ObjectId(value.id), isDeleted: false }, {}, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("workshop curriculum"), {}, {}))
        if (!isAdmin && response.isBlocked) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("workshop curriculum"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("workshop curriculum"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const complete_workshop_curriculum = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        const { error, value } = completeWorkshopCurriculumSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        // Check if curriculum exists
        const curriculum = await getFirstMatch(workshopCurriculumModel, { _id: new ObjectId(value.workshopCurriculumId), isDeleted: false }, {}, {})
        if (!curriculum) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("workshop curriculum"), {}, {}))

        // Upsert completion record (idempotent)
        const existing = await getFirstMatch(userWorkshopCurriculumCompletionModel, {
            userId: new ObjectId(userId),
            workshopCurriculumId: new ObjectId(value.workshopCurriculumId),
        }, {}, {})

        if (existing) {
            return res.status(200).json(new apiResponse(200, "Already completed", existing, {}))
        }

        const response = await createData(userWorkshopCurriculumCompletionModel, {
            userId: new ObjectId(userId),
            workshopId: new ObjectId(value.workshopId),
            workshopCurriculumId: new ObjectId(value.workshopCurriculumId),
        })

        return res.status(200).json(new apiResponse(200, "Workshop curriculum completed successfully", response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_workshop_progress = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        const { workshopId } = req.params
        if (!workshopId) return res.status(400).json(new apiResponse(400, "workshopId is required", {}, {}))

        // Get all non-blocked curriculum items for this workshop
        const allCurriculum = await getData(workshopCurriculumModel, {
            workshopId: new ObjectId(workshopId),
            isDeleted: false,
            isBlocked: false,
        }, {}, { lean: true })

        // Get completed items for this user
        const completions = await getData(userWorkshopCurriculumCompletionModel, {
            userId: new ObjectId(userId),
            workshopId: new ObjectId(workshopId),
        }, {}, { lean: true })

        const completedIds = completions.map((c: any) => c.workshopCurriculumId.toString())
        const totalCount = allCurriculum.length
        const completedCount = allCurriculum.filter((item: any) => completedIds.includes(item._id.toString())).length

        return res.status(200).json(new apiResponse(200, "Workshop progress fetched successfully", {
            completedCount,
            totalCount,
            completedIds,
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

