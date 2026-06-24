import { apiResponse } from "../../common";
import { contactUsModel } from "../../database";
import { reqInfo, responseMessage, updateData } from "../../helper";
import { addEditContactUsSchema } from "../../validation";

export const add_edit_contact_us = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addEditContactUsSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await updateData(contactUsModel, { isDeleted: false }, value, { upsert: true })

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("contact us"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_contact_us = async (req, res) => {
    reqInfo(req)
    try {
        const response = await contactUsModel.findOne({ isDeleted: false })

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contact us"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contact us"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}
