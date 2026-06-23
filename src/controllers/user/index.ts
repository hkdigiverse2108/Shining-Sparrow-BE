import { apiResponse, generateHash, generateToken, getUniqueOtr, USER_ROLES } from "../../common";
import { userAccountDeletionModel, userModel, userCourseModel, workshopPaymentModel } from "../../database";
import { countData, createData, findAllWithPopulate, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData, send_otr_mail } from "../../helper";
import { addUserSchema, editUserSchema, deleteUserSchema, getUserSchema } from "../../validation";
import bcryptjs from 'bcryptjs'

const ObjectId = require('mongoose').Types.ObjectId;

export const add_user = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addUserSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let existingUser = await getFirstMatch(userModel, { email: value?.email, role: USER_ROLES.USER, isDeleted: false }, {}, {})
        if (existingUser) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("Email"), {}, {}))

        existingUser = await getFirstMatch(userModel, { phoneNumber: value?.phoneNumber, role: USER_ROLES.USER, isDeleted: false }, {}, {})
        if (existingUser) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("Phone Number"), {}, {}))

        value.otr = await getUniqueOtr()
        value.password = await generateHash(value.password)
        const response = await createData(userModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const user_signup = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addUserSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let existingUser = await getFirstMatch(userModel, { email: value?.email, role: USER_ROLES.USER, isDeleted: false }, {}, {})
        if (existingUser) return res.status(400).json(new apiResponse(400, responseMessage?.alreadyEmail, {}, {}))

        if (value?.phoneNumber) {
            let existingPhone = await getFirstMatch(userModel, { phoneNumber: value?.phoneNumber, role: USER_ROLES.USER, isDeleted: false }, {}, {})
            if (existingPhone) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("Phone Number"), {}, {}))
        }

        value.otr = await getUniqueOtr()
        if (value.password) value.password = await generateHash(value.password)

        const response = await createData(userModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))

        try {
            await send_otr_mail(response, value.otr);
        } catch (mailError) {
            console.log("Error sending OTR welcome email:", mailError);
        }

        const token = await generateToken({
            _id: response._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, { expiresIn: '24h' })

        let newResponse = { ...response?._doc ? response?._doc : response, token }

        return res.status(200).json(new apiResponse(200, "Signup successfully", newResponse, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_user_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editUserSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let existingUser = await getFirstMatch(userModel, { email: value.email, role: USER_ROLES.USER, _id: { $ne: new ObjectId(value.userId) }, isDeleted: false }, {}, {})
        if (existingUser) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("Email"), {}, {}))

        const response = await updateData(userModel, { _id: new ObjectId(value.userId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("user"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_user_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteUserSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(userModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_user = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, startDate, endDate, activeFilter, deleteFilter } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { fullName: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } }
            ]
        }

        criteria.role = USER_ROLES.USER

        if (activeFilter !== undefined) criteria.isBlocked = activeFilter === 'true'

        if (deleteFilter) criteria.isDeleted = Boolean(deleteFilter)

        if (startDate && endDate) criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }

        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const response = await getDataWithSorting(userModel, criteria, { password: 0, otp: 0, otpExpireTime: 0 }, options)
        const totalCount = await countData(userModel, criteria)
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('user'), {
            user_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_user_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getUserSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await getFirstMatch(userModel, { _id: new ObjectId(value.id), isDeleted: false }, { password: 0, otp: 0, otpExpireTime: 0 }, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_all_delete_user = async (req, res) => {
    reqInfo(req)
    try {
        const { page, limit, search, startDate, endDate } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        if (search) {
            criteria.$or = [
                { fullName: { $regex: search, $options: 'si' } }
            ]
        }

        if (startDate && endDate) criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }

        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        let populateModel = [{ path: "userId" }]

        const response = await findAllWithPopulate(userAccountDeletionModel, criteria, {}, options, populateModel)
        const totalCount = await countData(userAccountDeletionModel, criteria)

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('user'), {
            user_delete_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_payment_history = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        // Get Course purchases
        const coursesPurchased = await userCourseModel.find({
            userId: new ObjectId(userId),
            isDeleted: false
        }).populate({
            path: 'courseId',
            select: 'name price image description'
        }).lean();

        // Get Workshop purchases
        const workshopsPurchased = await workshopPaymentModel.find({
            userId: new ObjectId(userId),
            isDeleted: false
        }).populate({
            path: 'workshopId',
            select: 'title price image subTitle'
        }).lean();

        const history: any[] = [];
        let totalSpent = 0;

        // Normalize Courses
        for (const record of coursesPurchased) {
            const course = record.courseId;
            const amountPaid = course?.price || 0;
            if (record.paymentStatus === 'completed') {
                totalSpent += amountPaid;
            }
            history.push({
                _id: record._id,
                type: 'course',
                name: course?.name || 'Unknown Course',
                image: course?.image || '',
                paymentId: record.razorpayPaymentId || 'N/A',
                orderId: record.razorpayOrderId || 'N/A',
                amount: amountPaid,
                status: record.paymentStatus,
                date: record.purchaseDate || record.createdAt
            });
        }

        // Normalize Workshops
        for (const record of workshopsPurchased) {
            const workshop = record.workshopId;
            const amountPaid = record.finalAmount ?? record.amount ?? workshop?.price ?? 0;
            if (record.paymentStatus === 'completed') {
                totalSpent += amountPaid;
            }
            history.push({
                _id: record._id,
                type: 'workshop',
                name: workshop?.title || 'Unknown Workshop',
                image: workshop?.image || '',
                paymentId: record.paymentId || 'N/A',
                orderId: record.receiptNumber || 'N/A',
                amount: amountPaid,
                status: record.paymentStatus,
                date: record.transactionDate || record.createdAt
            });
        }

        // Sort history by date descending
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('payment history'), {
            history,
            totalSpent
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}