import express from 'express'
import { blogRoute } from './blog'
import { authRouter } from './auth'
import { userRoute } from './user'
import { courseRoute } from './course'
import { settingsRoute } from './settings'
import { heroBannerRoute } from './hero-banner'
import { testimonialRoute } from './testimonial'
import { trustedPartnerRoute } from './trusted-partner'
import { faqRoute } from './faq'
import { newsletterRoute } from './newsletter'
import { galleryRoute } from './gallery'
import { legalityRoute } from './legality'
import { getInTouchRoute } from './get-in-touch'
import { workshopRoute } from './workshop'
import { workshopCurriculumRoute } from './workshop-curriculum'
import { couponCodeRoute } from './coupon-code'
import { courseLessonRoute } from './course-lesson'
import { instructorRoute } from './instructor'
import { referralCodeRoute } from './referral-code'
import { uploadRoute } from './upload'
import { aboutUsRouter } from './about-us'
import { dashboardRoute } from './dashboard'
import { questionRoute } from './question'
import { examRoute } from './exam'
import { notificationRoute } from './notification'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/user', userRoute)
router.use('/blog', blogRoute)
router.use('/course', courseRoute)
router.use('/settings', settingsRoute)
router.use('/hero-banner', heroBannerRoute)
router.use('/testimonial', testimonialRoute)
router.use('/trusted-partner', trustedPartnerRoute)
router.use('/faq', faqRoute)
router.use('/newsletter', newsletterRoute)
router.use('/gallery', galleryRoute)
router.use('/legality', legalityRoute)
router.use('/get-in-touch', getInTouchRoute)
router.use('/workshop', workshopRoute)
router.use('/workshop-curriculum', workshopCurriculumRoute)
router.use('/coupon-code', couponCodeRoute)
router.use('/course-lesson', courseLessonRoute)
router.use('/instructor', instructorRoute)
router.use('/referral-code', referralCodeRoute)
router.use('/upload', uploadRoute)
router.use('/about-us', aboutUsRouter)
router.use('/dashboard', dashboardRoute)
router.use('/question', questionRoute)
router.use('/exam', examRoute)
router.use('/notification', notificationRoute)

export { router }