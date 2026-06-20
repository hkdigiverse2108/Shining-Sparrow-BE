import { apiResponse } from "../../common";
import { notificationModel } from "../../database";
import { countData, createData, getData, reqInfo, responseMessage, updateData, updateMany } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const get_all_notifications = async (req, res) => {
    reqInfo(req)
    const { user } = req.headers;
    const userId = user?._id;
    if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

    try {
        let { page, limit } = req.query;
        let criteria: any = { userId: new ObjectId(userId), isDeleted: false };
        let options: any = { lean: true, sort: { createdAt: -1 } };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        let response = await getData(notificationModel, criteria, {}, options);
        let totalCount = await countData(notificationModel, criteria);

        // Check if the user has EVER had any notification record (including deleted ones) to avoid re-seeding after deletion
        const totalRecordCount = await countData(notificationModel, { userId: new ObjectId(userId) });

        // If user has never had any notification, seed default notifications for them
        if (totalRecordCount === 0) {
            const defaultNotifications = [
                {
                    userId: new ObjectId(userId),
                    title: 'Welcome from Sparky! 🐦',
                    message: 'Welcome to your new Shining Sparrow learning space! Sparky is super excited to learn abacus with you.',
                    type: 'system',
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(Date.now() - 60000)
                },
                {
                    userId: new ObjectId(userId),
                    title: 'Boss Challenge Unlocked! 🏆',
                    message: 'Woohoo! You are ready for the Level 1 Addition Boss Challenge. Let\'s show them your math powers!',
                    type: 'achievement',
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(Date.now() - 7200000)
                },
                {
                    userId: new ObjectId(userId),
                    title: 'Live Workshop Stream 🚀',
                    message: 'Don\'t forget! The \'Finger Math Magic\' Live Workshop is starting soon. Check the Workshops tab!',
                    type: 'workshop',
                    isRead: true,
                    isDeleted: false,
                    createdAt: new Date(Date.now() - 86400000)
                },
                {
                    userId: new ObjectId(userId),
                    title: 'New Sparrow News! 📰',
                    message: 'Read our latest blog: \'5 Easy Tips for Mental Math\' to practice your visualization skills.',
                    type: 'news',
                    isRead: true,
                    isDeleted: false,
                    createdAt: new Date(Date.now() - 172800000)
                }
            ];
            await notificationModel.insertMany(defaultNotifications);
            response = await getData(notificationModel, criteria, {}, options);
            totalCount = await countData(notificationModel, criteria);
        }

        const unreadCriteria = { userId: new ObjectId(userId), isRead: false, isDeleted: false };
        const unreadCount = await countData(notificationModel, unreadCriteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('notifications'), {
            notification_data: response,
            unreadCount: unreadCount,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const mark_read = async (req, res) => {
    reqInfo(req)
    const { user } = req.headers;
    const userId = user?._id;
    if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

    try {
        const { id } = req.body;
        if (id === 'all') {
            await updateMany(notificationModel, { userId: new ObjectId(userId), isRead: false }, { isRead: true }, {});
            return res.status(200).json(new apiResponse(200, "All notifications marked as read", {}, {}));
        } else {
            const response = await updateData(notificationModel, { _id: new ObjectId(id), userId: new ObjectId(userId) }, { isRead: true }, {});
            if (!response) return res.status(404).json(new apiResponse(404, "Notification not found", {}, {}));
            return res.status(200).json(new apiResponse(200, "Notification marked as read", response, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const delete_notification = async (req, res) => {
    reqInfo(req)
    const { user } = req.headers;
    const userId = user?._id;
    if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

    try {
        const { id } = req.body;
        if (id === 'all') {
            await updateMany(notificationModel, { userId: new ObjectId(userId), isDeleted: false }, { isDeleted: true }, {});
            return res.status(200).json(new apiResponse(200, "All notifications cleared", {}, {}));
        } else {
            const response = await updateData(notificationModel, { _id: new ObjectId(id), userId: new ObjectId(userId) }, { isDeleted: true }, {});
            if (!response) return res.status(404).json(new apiResponse(404, "Notification not found", {}, {}));
            return res.status(200).json(new apiResponse(200, "Notification deleted", response, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};
