import { apiResponse, USER_ROLES } from "../../common";
import { chatRoomModel, chatMessageModel, userModel } from "../../database";
import { createData, getFirstMatch, getData, updateData, countData, findAllWithPopulate } from "../../helper";
import { responseMessage } from "../../helper/response";

const ObjectId = require('mongoose').Types.ObjectId;

export const send_message = async (req, res) => {
    try {
        const { user } = req.headers;
        const { roomId, message, attachment, replyTo } = req.body;

        if (!user) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}));

        const isAdmin = user.role === USER_ROLES.ADMIN;

        // Global room message
        if (!roomId) {
            if (!isAdmin) {
                return res.status(403).json(new apiResponse(403, "Only admin can send global messages", {}, {}));
            }

            let globalRoom = await getFirstMatch(chatRoomModel, { type: 'global', isDeleted: false }, {}, {});
            if (!globalRoom) {
                globalRoom = await createData(chatRoomModel, {
                    type: 'global',
                    participants: [],
                    createdBy: new ObjectId(user._id),
                    lastMessage: message || (attachment ? attachment.name : ''),
                    lastMessageAt: new Date(),
                });
            }

            const newMessage = await createData(chatMessageModel, {
                roomId: new ObjectId(globalRoom._id),
                senderId: new ObjectId(user._id),
                message: message || '',
                ...(attachment && { attachment }),
                ...(replyTo && { replyTo: new ObjectId(replyTo) }),
            });

            await updateData(chatRoomModel, { _id: new ObjectId(globalRoom._id) }, { lastMessage: message || (attachment ? attachment.name : ''), lastMessageAt: new Date() }, {});

            const populatedMessage = await chatMessageModel.findById(newMessage._id)
                .populate('senderId', 'fullName role profilePhoto')
                .populate({
                    path: 'replyTo',
                    populate: {
                        path: 'senderId',
                        select: 'fullName role profilePhoto'
                    }
                })
                .lean();

            // Emit via Socket.io (attached in index.ts)
            if (req.app.get('io')) {
                req.app.get('io').to('global').emit('new_message', { roomId: globalRoom._id, message: populatedMessage });
            }

            return res.status(200).json(new apiResponse(200, "Message sent", { room: globalRoom, message: populatedMessage }, {}));
        }

        // Personal room message
        const room = await getFirstMatch(chatRoomModel, { _id: new ObjectId(roomId), isDeleted: false }, {}, {});
        if (!room) return res.status(404).json(new apiResponse(404, "Chat room not found", {}, {}));

        if (room.type === 'global') {
            if (!isAdmin) {
                return res.status(403).json(new apiResponse(403, "Only admin can send global messages", {}, {}));
            }
        } else {
            // Personal room: check user is a participant
            const isParticipant = room.participants.some(p => p.toString() === user._id.toString());
            if (!isParticipant && !isAdmin) {
                return res.status(403).json(new apiResponse(403, "You are not a participant of this room", {}, {}));
            }
        }

        const newMessage = await createData(chatMessageModel, {
            roomId: new ObjectId(roomId),
            senderId: new ObjectId(user._id),
            message: message || '',
            ...(attachment && { attachment }),
            ...(replyTo && { replyTo: new ObjectId(replyTo) }),
        });

        await updateData(chatRoomModel, { _id: new ObjectId(roomId) }, { lastMessage: message || (attachment ? attachment.name : ''), lastMessageAt: new Date() }, {});

        const populatedMessage = await chatMessageModel.findById(newMessage._id)
            .populate('senderId', 'fullName role profilePhoto')
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'senderId',
                    select: 'fullName role profilePhoto'
                }
            })
            .lean();

        // Emit to room participants
        if (req.app.get('io')) {
            req.app.get('io').to(roomId).emit('new_message', { roomId, message: populatedMessage });
        }

        return res.status(200).json(new apiResponse(200, "Message sent", { message: populatedMessage }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_rooms = async (req, res) => {
    try {
        const { user } = req.headers;
        if (!user) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}));

        const isAdmin = user.role === USER_ROLES.ADMIN;

        // Auto-create global room if it doesn't exist
        let globalRoom = await getFirstMatch(chatRoomModel, { type: 'global', isDeleted: false }, {}, {});
        if (!globalRoom) {
            globalRoom = await createData(chatRoomModel, {
                type: 'global',
                participants: [],
                createdBy: new ObjectId(user._id),
                lastMessage: '',
                lastMessageAt: new Date(),
            });
        }

        const criteria: any = { isDeleted: false };

        if (isAdmin) {
            criteria.type = { $in: ['global', 'personal'] };
        } else {
            criteria.$or = [
                { type: 'global' },
                { type: 'personal', participants: new ObjectId(user._id) },
            ];
        }

        const rooms = await findAllWithPopulate(chatRoomModel, criteria, {}, { sort: { lastMessageAt: -1, createdAt: -1 }, lean: true }, [
            { path: 'participants', select: 'fullName role profilePhoto' },
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('chat rooms'), { room_data: rooms }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_messages = async (req, res) => {
    try {
        const { user } = req.headers;
        const { roomId } = req.params;
        const { page, limit } = req.query;

        if (!user) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}));

        const room = await getFirstMatch(chatRoomModel, { _id: new ObjectId(roomId), isDeleted: false }, {}, {});
        if (!room) return res.status(404).json(new apiResponse(404, "Chat room not found", {}, {}));

        // Check access
        const isAdmin = user.role === USER_ROLES.ADMIN;
        if (room.type === 'personal') {
            const isParticipant = room.participants.some(p => p.toString() === user._id.toString());
            if (!isParticipant && !isAdmin) {
                return res.status(403).json(new apiResponse(403, "Access denied", {}, {}));
            }
        }

        const criteria = { roomId: new ObjectId(roomId), isDeleted: false };
        const options: any = { lean: true, sort: { createdAt: -1 } };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const messages = await getData(chatMessageModel, criteria, {}, options);
        const totalCount = await countData(chatMessageModel, criteria);

        // Populate sender info and replyTo info
        const populatedMessages = await chatMessageModel.populate(messages, [
            { path: 'senderId', select: 'fullName role profilePhoto' },
            {
                path: 'replyTo',
                populate: {
                    path: 'senderId',
                    select: 'fullName role profilePhoto'
                }
            }
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('messages'), {
            message_data: populatedMessages.reverse(),
            totalData: totalCount,
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const create_room = async (req, res) => {
    try {
        const { user } = req.headers;
        if (!user) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}));

        const { recipientId } = req.body;
        const isAdmin = user.role === USER_ROLES.ADMIN;

        let targetUser;

        if (isAdmin) {
            // Admin is creating a room: target is the recipientId (student)
            if (!recipientId) return res.status(400).json(new apiResponse(400, "Recipient ID is required", {}, {}));
            targetUser = await getFirstMatch(userModel, { _id: new ObjectId(recipientId), isDeleted: false }, {}, {});
            if (!targetUser) return res.status(404).json(new apiResponse(404, "Student not found", {}, {}));
        } else {
            // Student is creating a room: target is the adminUser (first admin)
            targetUser = await getFirstMatch(userModel, { role: USER_ROLES.ADMIN, isDeleted: false }, {}, {});
            if (!targetUser) return res.status(404).json(new apiResponse(404, "Admin not found", {}, {}));
        }

        // Check if a personal room already exists between this user and targetUser
        const existingRoom = await getFirstMatch(chatRoomModel, {
            type: 'personal',
            isDeleted: false,
            participants: { $all: [new ObjectId(user._id), new ObjectId(targetUser._id)] },
        }, {}, {});

        if (existingRoom) {
            const populatedRoom = await chatRoomModel.findById(existingRoom._id).populate('participants', 'fullName role profilePhoto').lean();
            return res.status(200).json(new apiResponse(200, "Room already exists", { room: populatedRoom }, {}));
        }

        const newRoom = await createData(chatRoomModel, {
            type: 'personal',
            participants: [new ObjectId(user._id), new ObjectId(targetUser._id)],
            createdBy: new ObjectId(user._id),
        });

        const populatedRoom = await chatRoomModel.findById(newRoom._id).populate('participants', 'fullName role profilePhoto').lean();

        // Notify via Socket.io and join participants to the room
        const ioInstance = req.app.get('io');
        if (ioInstance) {
            const participantsIds = [user._id.toString(), targetUser._id.toString()];
            participantsIds.forEach(pId => {
                const sockets = ioInstance.sockets.adapter.rooms.get(pId);
                if (sockets) {
                    for (const socketId of sockets) {
                        const s = ioInstance.sockets.sockets.get(socketId);
                        if (s) {
                            s.join(newRoom._id.toString());
                        }
                    }
                }
            });

            // Join all connected admins to this room
            const adminSockets = ioInstance.sockets.adapter.rooms.get('admins');
            if (adminSockets) {
                for (const socketId of adminSockets) {
                    const s = ioInstance.sockets.sockets.get(socketId);
                    if (s) {
                        s.join(newRoom._id.toString());
                    }
                }
            }

            // Emit to targetUser and user, plus all other admins
            ioInstance.to('admins').emit('room_created', { room: populatedRoom });
            ioInstance.to(user._id.toString()).emit('room_created', { room: populatedRoom });
            if (!isAdmin) {
                ioInstance.to(targetUser._id.toString()).emit('room_created', { room: populatedRoom });
            }
        }

        return res.status(200).json(new apiResponse(200, "Room created", { room: populatedRoom }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};
