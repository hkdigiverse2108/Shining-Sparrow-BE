import { apiResponse, USER_ROLES } from "../../common";
import { courseLessonModel, courseModel, settingsModel, userCourseModel, userModel, userExamAttemptModel, userLessonCompletionModel } from "../../database";
import { countData, createData, findAllWithPopulate, findOneAndPopulate, getData, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { addCourseSchema, editCourseSchema, deleteCourseSchema, getCourseSchema, purchaseCourseSchema } from "../../validation";
import Razorpay from "razorpay";
import { computeLessonUnlockStatus } from "../course-lesson";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_course = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addCourseSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await createData(courseModel, value);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("course"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_course_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = editCourseSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await updateData(courseModel, { _id: new ObjectId(value.courseId), isDeleted: false }, value, {})
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("course"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("course"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_course_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteCourseSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        const response = await updateData(courseModel, { _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("course"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

const enrichCourseDetails = async (course: any, userId: string | null) => {
    if (course.courseCurriculumIds && course.courseCurriculumIds.length > 0 && course.courseCurriculumIds[0] && typeof course.courseCurriculumIds[0] === 'object') {
        let allLessons: any[] = [];
        const subCourses = course.courseCurriculumIds.filter((sc: any) => sc && sc._id && !sc.isDeleted);
        const mappedCurriculums: any[] = [];

        for (const subCourse of subCourses) {
            const lessons = await courseLessonModel.find({ courseId: subCourse._id, isDeleted: false }).sort({ priority: 1 }).lean();
            mappedCurriculums.push({
                _id: subCourse._id,
                title: subCourse.name,
                description: subCourse.description,
                image: subCourse.image,
                pdf: subCourse.pdf,
                price: subCourse.price,
                courseLessonsAssigned: lessons
            });
            allLessons = allLessons.concat(lessons);
        }

        const enrichedLessons = await computeLessonUnlockStatus(allLessons, userId, subCourses.map((sc: any) => sc._id));
        const lessonMap = new Map();
        for (const el of enrichedLessons) {
            lessonMap.set(el._id.toString(), el);
        }

        for (const mc of mappedCurriculums) {
            mc.courseLessonsAssigned = mc.courseLessonsAssigned.map(l => lessonMap.get(l._id.toString()));
        }

        course.courseCurriculumIds = mappedCurriculums;
        course.totalLesson = enrichedLessons.length;
    } else {
        const lessons = await courseLessonModel.find({ courseId: course._id, isDeleted: false }).sort({ priority: 1 }).lean();
        const lessonsWithUnlock = await computeLessonUnlockStatus(lessons, userId);
        course.courseLessonIds = lessonsWithUnlock;
        course.totalLesson = lessons.length;
    }
    return course;
};

export const get_all_course = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { page, limit, search, startDate, endDate } = req.query
        let criteria: any = { isDeleted: false }, options: any = { lean: true }

        const isAdmin = user && user.role === USER_ROLES.ADMIN;
        if (!isAdmin) {
            criteria.isBlocked = false;
        }

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } }
            ]
        }
        if (startDate && endDate) {
            criteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = [
            { path: 'courseCurriculumIds' }
        ];
        const response = await findAllWithPopulate(courseModel, criteria, {}, options, populateModel)
        const totalCount = await countData(courseModel, criteria)

        const unlockedSet = new Set(
            (user?.courseIds || []).map((id) => id.toString())
        );

        let newResponse: any[] = [];
        const userId = user?._id ? user._id.toString() : null;

        for (let course of response) {
            const enriched = await enrichCourseDetails(course, userId);
            newResponse.push({
                ...enriched,
                isUnlocked: unlockedSet.has(course?._id.toString()),
            });
        }

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('course'), {
            course_data: newResponse,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_course_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = getCourseSchema.validate(req.params)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const populateModel = [{ path: 'courseCurriculumIds' }];
        const response = await findOneAndPopulate(courseModel, { _id: new ObjectId(value.id), isDeleted: false }, {}, {}, populateModel);
        if (!response || response.isDeleted) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course"), {}, {}))

        const isAdmin = user && user.role === USER_ROLES.ADMIN;
        if (!isAdmin && response.isBlocked) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course"), {}, {}))
        }

        const userId = user && user?._id ? user._id.toString() : null;
        const enriched = await enrichCourseDetails(response, userId);

        enriched.isUnlocked = false
        enriched.isAccessExpired = false
        enriched.daysRemaining = null
        enriched.accessExpiryDate = null
        if (user && user?._id) {
            let isExist = await getFirstMatch(userModel, { _id: new ObjectId(user._id), courseIds: { $in: [new ObjectId(value.id)] }, isDeleted: false }, {}, {})
            if (isExist) {
                enriched.isUnlocked = true
                // Check access expiry
                const userCourseRecord = await getFirstMatch(userCourseModel, {
                    userId: new ObjectId(user._id),
                    courseId: new ObjectId(value.id),
                    isDeleted: false
                }, {}, {})
                if (userCourseRecord) {
                    const now = new Date();
                    const expiry = userCourseRecord.accessExpiryDate ? new Date(userCourseRecord.accessExpiryDate) : null;
                    enriched.accessExpiryDate = expiry;
                    enriched.accessStartDate = userCourseRecord.accessStartDate || userCourseRecord.purchaseDate;
                    enriched.isAccessExpired = expiry ? expiry < now : false;
                    enriched.daysRemaining = expiry && expiry >= now
                        ? Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                        : null;
                }
            }
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course"), enriched, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const purchase_course = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = purchaseCourseSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const userId = req.headers.user?._id;
        if (!userId) return res.status(401).json(new apiResponse(401, "User not authenticated", {}, {}))

        const course = await getFirstMatch(courseModel, { _id: new ObjectId(value.courseId), isDeleted: false }, {}, {})
        if (!course) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("course"), {}, {}))

        const existingPurchase = await getFirstMatch(userCourseModel, { userId: new ObjectId(userId), courseId: new ObjectId(value.courseId), isDeleted: false }, {}, {})
        if (existingPurchase) return res.status(400).json(new apiResponse(400, "Course already purchased", {}, {}))

        const accessStartDate = new Date();
        let accessExpiryDate: Date | null = null;
        if (course.accessDurationDays && course.accessDurationDays > 0) {
            accessExpiryDate = new Date(accessStartDate.getTime() + course.accessDurationDays * 24 * 60 * 60 * 1000);
        }

        const purchaseData = {
            userId: new ObjectId(userId),
            courseId: new ObjectId(value.courseId),
            paymentStatus: value.razorpayPaymentId ? 'completed' : 'pending',
            razorpayOrderId: value.razorpayOrderId,
            razorpayPaymentId: value.razorpayPaymentId,
            accessStartDate,
            accessExpiryDate,
        }

        const response = await createData(userCourseModel, purchaseData);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        await updateData(userModel, { _id: new ObjectId(response?.userId), isDeleted: false }, { $push: { courseIds: new ObjectId(response.courseId) } }, { new: true, timestamps: false })
        await updateData(courseModel, { _id: new ObjectId(response.courseId), isDeleted: false }, { $inc: { enrolledLearners: 1 } }, {})
        return res.status(200).json(new apiResponse(200, responseMessage?.purchaseSuccess, response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_my_courses = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, { page, limit } = req.query, criteria: any = { isDeleted: false }, options: any = { lean: true }
    try {

        if (user?.role === USER_ROLES.USER) {
            criteria.userId = new ObjectId(user._id)
        }

        let courses = await getData(courseModel, { isDeleted: false }, {}, {})
        criteria.courseId = { $in: courses.map(e => new ObjectId(e._id)) }

        options.sort = { createdAt: -1 }
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit)
            options.limit = parseInt(limit)
        }

        const populateModel = [
            { path: 'courseId', select: 'name description price image enrolledLearners classCompleted satisfactionRate duration courseCurriculumIds courseLessonIds' },
            { path: 'userId', select: 'fullName email phoneNumber profilePhoto designation' },
        ];

        const response = await findAllWithPopulate(userCourseModel, criteria, {}, options, populateModel)
        const totalCount = await countData(userCourseModel, criteria)

        let newResponse: any[] = [];

        for (let course of response) {
            const courseDetail = course.courseId;
            let lessonIds: any[] = [];
            let totalLesson = 0;

            if (courseDetail) {
                if (courseDetail.courseCurriculumIds && courseDetail.courseCurriculumIds.length > 0) {
                    // Merged course: lessons belong to sub-courses
                    const subLessons = await courseLessonModel.find({
                        courseId: { $in: courseDetail.courseCurriculumIds },
                        isDeleted: false
                    }).select('_id');
                    lessonIds = subLessons.map(l => l._id);
                    totalLesson = lessonIds.length;
                } else {
                    // Single course: query courseLessonModel directly to ensure it matches enrichCourseDetails
                    const flatLessons = await courseLessonModel.find({
                        courseId: courseDetail._id,
                        isDeleted: false
                    }).select('_id');
                    lessonIds = flatLessons.map(l => l._id);
                    totalLesson = lessonIds.length;
                }
            }

            const targetUserId = course.userId?._id || course.userId;

            const passedExamLessons = await userExamAttemptModel.find({
                userId: targetUserId,
                courseLessonId: { $in: lessonIds },
                status: 'pass'
            }).distinct('courseLessonId');

            const manuallyCompletedLessons = await userLessonCompletionModel.find({
                userId: targetUserId,
                courseLessonId: { $in: lessonIds }
            }).distinct('courseLessonId');

            const completedLessonSet = new Set([
                ...passedExamLessons.map(id => id.toString()),
                ...manuallyCompletedLessons.map(id => id.toString())
            ]);

            const completedLessons = completedLessonSet.size;

            // Compute access expiry info
            const now = new Date();
            const accessExpiryDate = course.accessExpiryDate ? new Date(course.accessExpiryDate) : null;
            const isAccessExpired = accessExpiryDate ? accessExpiryDate < now : false;
            let daysRemaining: number | null = null;
            if (accessExpiryDate && !isAccessExpired) {
                daysRemaining = Math.ceil((accessExpiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
            }

            newResponse.push({
                ...course,
                totalLesson,
                completedLessons,
                accessStartDate: course.accessStartDate || course.purchaseDate || course.createdAt,
                accessExpiryDate: course.accessExpiryDate || null,
                isAccessExpired,
                daysRemaining,
            });
        }

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        }

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('my courses'), {
            my_courses_data: newResponse,
            purchased_course_data: newResponse,
            totalData: totalCount,
            state: stateObj
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const verifyPayment = async (req, res) => {
    reqInfo(req)
    try {
        const { payment_id } = req.body;
        let setting = await settingsModel.findOne({});
        const razorpay = new Razorpay({
            key_id: setting.razorpayKey,
            key_secret: setting.razorpaySecret,
        });

        const payment = await razorpay.payments.fetch(payment_id);
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("verify payment"), payment, {}))
    } catch (error) {
        console.log("Razorpay verify error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}));
    }
};