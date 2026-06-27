import gcm from 'node-gcm'
import { config } from '../../config';
import { notificationModel, userModel } from '../database';
import { USER_ROLES } from '../common';

const sender = new gcm.Sender(config.FCM_KEY)

export const notification_to_user = async (sender_user_data: any, data: any, notification: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sender_user_data && data && notification && sender_user_data?.deviceToken?.length != 0 && sender_user_data != undefined && sender_user_data != null) {
                let message = new gcm.Message({
                    data: data,
                    notification: notification
                });
                sender.send(message, {
                    registrationTokens: sender_user_data?.deviceToken
                }, function (err, response) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(response)
                    }
                })
            }
            else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}

export const notification_to_multiple_user = async (multiple_user_data: any, data: any, notification: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (multiple_user_data && data && notification) {
                let deviceToken: any = []
                for (let i = 0; i < multiple_user_data?.length; i++) {
                    deviceToken.push(...multiple_user_data[i]?.deviceToken)
                }
                if (deviceToken.length != 0) {
                    let message = new gcm.Message({
                        data: data,
                        notification: notification
                    });
                    sender.send(message, {
                        registrationTokens: deviceToken
                    }, function (err, response) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(response)
                        }
                    })
                }
                else {
                    resolve(true)
                }
            }
            else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}

export const createDbNotification = async (
    userId: any,
    title: string,
    message: string,
    type: 'achievement' | 'system' | 'workshop' | 'news' = 'system'
) => {
    try {
        await new notificationModel({
            userId,
            title,
            message,
            type,
            isRead: false,
            isDeleted: false
        }).save();
    } catch (err) {
        console.error("Failed to create database notification:", err);
    }
};

export const createAdminNotification = async (
    title: string,
    message: string,
    type: 'achievement' | 'system' | 'workshop' | 'news' = 'system'
) => {
    try {
        const admins = await userModel.find({ role: USER_ROLES.ADMIN, isDeleted: false }, { _id: 1 }).lean();
        const notifications = admins.map((admin: any) => ({
            userId: admin._id,
            title,
            message,
            type,
            isRead: false,
            isDeleted: false
        }));
        if (notifications.length > 0) {
            await notificationModel.insertMany(notifications);
        }
    } catch (err) {
        console.error("Failed to create admin notification:", err);
    }
};
