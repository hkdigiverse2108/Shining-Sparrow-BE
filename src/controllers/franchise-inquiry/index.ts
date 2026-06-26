import { apiResponse } from "../../common";
import { franchiseInquiryModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { addFranchiseInquirySchema, editFranchiseInquirySchema, deleteFranchiseInquirySchema, getFranchiseInquirySchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_franchise_inquiry = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addFranchiseInquirySchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await createData(franchiseInquiryModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("franchise inquiry"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_franchise_inquiry_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editFranchiseInquirySchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await updateData(franchiseInquiryModel, { _id: new ObjectId(value.franchiseInquiryId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("franchise inquiry"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("franchise inquiry"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_franchise_inquiry_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteFranchiseInquirySchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(franchiseInquiryModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("franchise inquiry"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("franchise inquiry"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_franchise_inquiry = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, startDate, endDate, isRead } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } },
                { city: { $regex: search, $options: 'si' } },
                { state: { $regex: search, $options: 'si' } },
                { occupation: { $regex: search, $options: 'si' } },
                { message: { $regex: search, $options: 'si' } },
            ]
        }
        if (isRead !== undefined) {
            criteria.isRead = isRead === 'true'
        }
        if (startDate && endDate) {
            criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const response = await getDataWithSorting(franchiseInquiryModel, criteria, {}, options)
        const totalCount = await countData(franchiseInquiryModel, criteria)
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('franchise inquiries'), {
            franchise_inquiries_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_franchise_inquiry_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getFranchiseInquirySchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await getFirstMatch(franchiseInquiryModel, { _id: new ObjectId(value.id), isDeleted: false }, {}, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("franchise inquiry"), {}, {}))

        // Mark as read when viewing
        await updateData(franchiseInquiryModel, { _id: new ObjectId(value.id) }, { isRead: true }, {})

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("franchise inquiry"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}
