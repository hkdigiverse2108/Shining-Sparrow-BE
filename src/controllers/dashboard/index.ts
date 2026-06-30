import { apiResponse, PAYMENT_STATUS, USER_ROLES } from "../../common";
import { courseModel, userCourseModel, userModel, workshopModel, workshopPaymentModel, adminLoginHistoryModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";

export const dashboard = async (req, res) => {
    reqInfo(req)
    try {
        let [sec1, sec2, sec3]: any = await Promise.all([
            (async () => {
                let dashboard = await getDashboardData()
                return dashboard
            })(),
            (async () => {

            })()
        ])
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("dashboard"), { sec1, sec2, sec3 }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const getDashboardData = async () => {
    try {
        const totalStudents = await userModel.countDocuments({ role: USER_ROLES.USER, isDeleted: false });
        const totalCourses = await courseModel.countDocuments({ isDeleted: false });
        const totalWorkshops = await workshopModel.countDocuments({ isDeleted: false });
        const workshopPurchaseCount = await workshopPaymentModel.countDocuments({ isDeleted: false })
        const coursePurchaseCount = await userCourseModel.countDocuments({ isDeleted: false })
        return {
            totalStudents, totalCourses, totalWorkshops, workshopPurchaseCount, coursePurchaseCount
        }

    } catch (error) {
        console.log("error:", error);
    }
};

export const analytics = async (req, res) => {
    reqInfo(req)
    try {
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        // Generate labels for the last 12 months
        const monthLabels: { month: number; year: number; label: string }[] = [];
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
            monthLabels.push({
                month: d.getMonth() + 1,
                year: d.getFullYear(),
                label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
            });
        }

        // --- Workshop Revenue Aggregation ---
        const workshopAgg = await workshopPaymentModel.aggregate([
            {
                $match: {
                    paymentStatus: PAYMENT_STATUS.COMPLETED,
                    isDeleted: false,
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    revenue: { $sum: { $ifNull: ['$finalAmount', '$amount'] } },
                    count: { $sum: 1 },
                },
            },
        ]);

        // --- Course Revenue Aggregation ---
        // user-course doesn't store amount, so we join with the course model
        const courseAgg = await userCourseModel.aggregate([
            {
                $match: {
                    paymentStatus: PAYMENT_STATUS.COMPLETED,
                    isDeleted: false,
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    revenue: { $sum: { $ifNull: ['$course.price', 0] } },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Build lookup maps
        const workshopMap: Record<string, { revenue: number; count: number }> = {};
        workshopAgg.forEach((item) => {
            workshopMap[`${item._id.year}-${item._id.month}`] = {
                revenue: item.revenue || 0,
                count: item.count || 0,
            };
        });

        const courseMap: Record<string, { revenue: number; count: number }> = {};
        courseAgg.forEach((item) => {
            courseMap[`${item._id.year}-${item._id.month}`] = {
                revenue: item.revenue || 0,
                count: item.count || 0,
            };
        });

        // Merge into monthly breakdown
        let totalCourseRevenue = 0;
        let totalWorkshopRevenue = 0;

        const monthly = monthLabels.map(({ month, year, label }) => {
            const key = `${year}-${month}`;
            const ws = workshopMap[key] || { revenue: 0, count: 0 };
            const cs = courseMap[key] || { revenue: 0, count: 0 };

            totalCourseRevenue += cs.revenue;
            totalWorkshopRevenue += ws.revenue;

            return {
                month,
                year,
                label,
                courseRevenue: cs.revenue,
                workshopRevenue: ws.revenue,
                totalRevenue: cs.revenue + ws.revenue,
                coursePurchases: cs.count,
                workshopPurchases: ws.count,
                totalPurchases: cs.count + ws.count,
            };
        });

        const result = {
            monthly,
            summary: {
                totalCourseRevenue,
                totalWorkshopRevenue,
                grandTotalRevenue: totalCourseRevenue + totalWorkshopRevenue,
            },
        };

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("analytics"), result, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const loginHistory = async (req, res) => {
    reqInfo(req)
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [records, total] = await Promise.all([
            adminLoginHistoryModel.find({ adminId: req.headers.user?._id, isDeleted: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            adminLoginHistoryModel.countDocuments({ adminId: req.headers.user?._id, isDeleted: false }),
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("login history"), {
            records,
            total,
            page: pageNum,
            limit: limitNum,
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const deleteLoginHistory = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const log = await adminLoginHistoryModel.findOne({ _id: id });
        if (!log) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("login log"), {}, {}));
        }

        if (log.isBlocked) {
            // Soft delete: keep the record to maintain the block, but hide from UI
            log.isDeleted = true;
            await log.save();
        } else {
            // Hard delete: remove from DB
            await adminLoginHistoryModel.deleteOne({ _id: id });
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("login history"), {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const blockDevice = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const log = await adminLoginHistoryModel.findOne({ _id: id });
        if (!log) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("login log"), {}, {}));
        }

        // Set isBlocked to true on this log only
        log.isBlocked = true;
        await log.save();

        return res.status(200).json(new apiResponse(200, "Device has been successfully blocked!", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const unblockDevice = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const log = await adminLoginHistoryModel.findOne({ _id: id });
        if (!log) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("login log"), {}, {}));
        }

        // Unblock all active/soft-deleted logs matching this device/userAgent to fully unblock the device
        await adminLoginHistoryModel.updateMany(
            {
                ipAddress: log.ipAddress,
                $or: [
                    ...(log.device && log.device !== 'Unknown' ? [{ device: log.device }] : []),
                    { userAgent: log.userAgent }
                ]
            },
            { isBlocked: false }
        );

        return res.status(200).json(new apiResponse(200, "Device has been successfully unblocked!", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};