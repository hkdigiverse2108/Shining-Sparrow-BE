# API Endpoints Documentation

Base URL: `http://localhost:PORT` (Replace PORT with your server port)

## Admin APIs

### Auth APIs

#### 1. POST Sign Up

```bash
curl -X POST {{BASE_URL}}/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "designation": "Developer"
  }'
```

#### 2. POST Login

Allows both Admin (email & password) and Student (phone number & OTR) login.

**Option A: Admin Login (email & password)**

```bash
curl -X POST {{BASE_URL}}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "admin",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Option B: Student Login (phone number & OTR)**

```bash
curl -X POST {{BASE_URL}}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "phoneNumber": "+1234567890",
    "otr": "38294710"
  }'
```

#### 3. POST OTP Verify

```bash
curl -X POST {{BASE_URL}}/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

#### 4. POST Forgot Password

```bash
curl -X POST {{BASE_URL}}/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### 5. POST Reset Password

```bash
curl -X POST {{BASE_URL}}/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "newPassword": "newpassword123"
  }'
```

#### 6. POST Resend OTP

```bash
curl -X POST {{BASE_URL}}/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### 7. POST Change Password

```bash
curl -X POST {{BASE_URL}}/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

#### 8. POST Update Profile

```bash
curl -X POST {{BASE_URL}}/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_TOKEN_HERE" \
  -d '{
    "fullName": "John Doe Updated",
    "phone": "+1234567890",
    "designation": "Senior Developer",
    "profilePhoto": "https://example.com/photo.jpg"
  }'
```

---

### User APIs

#### 1. POST User Signup

```bash
curl -X POST {{BASE_URL}}/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123",
    "designation": "Manager",
    "district": "Surat",
    "std": "5th",
    "reachFrom": "Social Media",
    "agreeTerms": true
  }'
```

**Response includes unique 8-digit `otr`:**

```json
{
  "status": 200,
  "message": "Signup successfully",
  "data": {
    "_id": "USER_ID_HERE",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "otr": "38294710",
    "district": "Surat",
    "std": "5th",
    "reachFrom": "Social Media",
    "role": "user",
    "token": "JWT_TOKEN_HERE"
  }
}
```

#### 2. POST Add User

```bash
curl -X POST {{BASE_URL}}/user/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123",
    "designation": "Manager",
    "role": "user",
    "agreeTerms": true
  }'
```

#### 3. POST Update User

```bash
curl -X POST {{BASE_URL}}/user/update \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": "USER_ID_HERE",
    "fullName": "Jane Smith Updated",
    "phone": "+1234567890",
    "designation": "Senior Manager",
    "profilePhoto": "https://example.com/photo.jpg"
  }'
```

#### 4. DELETE Delete User

```bash
curl -X DELETE {{BASE_URL}}/user/delete/USER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 5. GET Get All Users

```bash
curl -X GET "{{BASE_URL}}/user/all?page=1&limit=10&search=john&isBlocked=false&startDate=2024-01-01&endDate=2024-12-31" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 6. GET Get User By ID

```bash
curl -X GET {{BASE_URL}}/user/USER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

---

### Blog APIs

#### 1. POST Add Blog

```bash
curl -X POST {{BASE_URL}}/blog/add \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog",
    "subTitle": "Subtitle here",
    "content": "Blog content here",
    "category": "Technology",
    "coverImage": "https://example.com/cover.jpg",
    "mainImage": "https://example.com/main.jpg",
    "author": "John Doe",
    "quote": "Inspirational quote",
    "isFeatured": true
  }'
```

#### 2. POST Update Blog

```bash
curl -X POST {{BASE_URL}}/blog/edit \
  -H "Content-Type: application/json" \
  -d '{
    "blogId": "BLOG_ID_HERE",
    "title": "Updated Blog Title",
    "subtitle": "Updated subtitle",
    "content": "Updated content",
    "category": "Technology",
    "isFeatured": false
  }'
```

#### 3. DELETE Delete Blog

```bash
curl -X DELETE {{BASE_URL}}/blog/delete/BLOG_ID_HERE
```

#### 4. GET Get All Blogs

```bash
curl -X GET "{{BASE_URL}}/blog/all?page=1&limit=10&search=technology&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Blog By ID

```bash
curl -X GET {{BASE_URL}}/blog/BLOG_ID_HERE
```

---

### Course APIs

#### 1. POST Add Course

```bash
curl -X POST {{BASE_URL}}/course/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "React Masterclass",
    "description": "Learn React from scratch",
    "price": 99.99,
    "image": "https://example.com/course.jpg",
    "purchasedCoursesShow": true,
    "enrolledLearners": 0,
    "classCompleted": 0,
    "satisfactionRate": 0
  }'
```

#### 2. POST Update Course

```bash
curl -X POST {{BASE_URL}}/course/update \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "courseId": "COURSE_ID_HERE",
    "name": "Advanced React Masterclass",
    "price": 149.99,
    "enrolledLearners": 50
  }'
```

#### 3. DELETE Delete Course

```bash
curl -X DELETE {{BASE_URL}}/course/delete/COURSE_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. POST Purchase Course

```bash
curl -X POST {{BASE_URL}}/course/purchase \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_USER_TOKEN_HERE" \
  -d '{
    "courseId": "COURSE_ID_HERE",
    "razorpayOrderId": "ORDER_ID_HERE",
    "razorpayPaymentId": "PAYMENT_ID_HERE"
  }'
```

#### 5. GET Get My Courses

```bash
curl -X GET "{{BASE_URL}}/course/my-courses?page=1&limit=10" \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

#### 6. GET Get All Courses

```bash
curl -X GET "{{BASE_URL}}/course/get?page=1&limit=10&search=react&courseCategoryId=CATEGORY_ID_HERE&startDate=2024-01-01&endDate=2024-12-31"
```

#### 7. GET Get Course By ID

```bash
curl -X GET {{BASE_URL}}/course/COURSE_ID_HERE
```

---

### Settings APIs

#### 1. POST Add/Edit Settings

```bash
curl -X POST {{BASE_URL}}/settings/add-edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "logo": "https://example.com/logo.png",
    "razorpayKey": "YOUR_RAZORPAY_KEY",
    "razorpaySecret": "YOUR_RAZORPAY_SECRET",
    "enrolledLearners": 1000,
    "classCompleted": 500,
    "satisfactionRate": 95
  }'
```

#### 2. GET Get Settings

```bash
curl -X GET {{BASE_URL}}/settings/get
```

---

### Hero Banner APIs

#### 1. POST Add Hero Banner

```bash
curl -X POST {{BASE_URL}}/hero-banner/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "type": "Web",
    "title": "Welcome to Our Platform",
    "description": "Learn new skills",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
  }'
```

#### 2. POST Update Hero Banner

```bash
curl -X POST {{BASE_URL}}/hero-banner/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "heroBannerId": "BANNER_ID_HERE",
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

#### 3. DELETE Delete Hero Banner

```bash
curl -X DELETE {{BASE_URL}}/hero-banner/delete/BANNER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Hero Banners

```bash
curl -X GET "{{BASE_URL}}/hero-banner/all?page=1&limit=10&search=welcome&type=Web&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Hero Banner By ID

```bash
curl -X GET {{BASE_URL}}/hero-banner/BANNER_ID_HERE
```

---

### Testimonial APIs

#### 1. POST Add Testimonial

```bash
curl -X POST {{BASE_URL}}/testimonial/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "image": "https://example.com/photo.jpg",
    "name": "John Doe",
    "designation": "Software Engineer",
    "rate": 5,
    "description": "Great course!",
    "isFeatured": true,
    "type": "Course"
  }'
```

#### 2. POST Update Testimonial

```bash
curl -X POST {{BASE_URL}}/testimonial/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "testimonialId": "TESTIMONIAL_ID_HERE",
    "name": "John Doe Updated",
    "rate": 5
  }'
```

#### 3. DELETE Delete Testimonial

```bash
curl -X DELETE {{BASE_URL}}/testimonial/delete/TESTIMONIAL_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Testimonials

```bash
curl -X GET "{{BASE_URL}}/testimonial/all?page=1&limit=10&search=john&type=Course&isFeatured=true&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Testimonial By ID

```bash
curl -X GET {{BASE_URL}}/testimonial/TESTIMONIAL_ID_HERE
```

---

### Trusted Partner APIs

#### 1. POST Add Trusted Partner

```bash
curl -X POST {{BASE_URL}}/trusted-partner/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "image": "https://example.com/partner.jpg",
    "name": "Partner Company",
    "description": "Our trusted partner"
  }'
```

#### 2. POST Update Trusted Partner

```bash
curl -X POST {{BASE_URL}}/trusted-partner/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "trustedPartnerId": "PARTNER_ID_HERE",
    "name": "Updated Partner Name"
  }'
```

#### 3. DELETE Delete Trusted Partner

```bash
curl -X DELETE {{BASE_URL}}/trusted-partner/delete/PARTNER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Trusted Partners

```bash
curl -X GET "{{BASE_URL}}/trusted-partner/all?page=1&limit=10&search=partner&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Trusted Partner By ID

```bash
curl -X GET {{BASE_URL}}/trusted-partner/PARTNER_ID_HERE
```

---

### FAQ APIs (Multi-Language)

> FAQs now support 3 languages: English (`en`, required), Hindi (`hi`, optional), and Gujarati (`gu`, optional). Both `question` and `answer` are objects with language keys. Search works across all 3 languages.

#### 1. POST Add FAQ

```bash
curl -X POST {{BASE_URL}}/faq/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "question": {
      "en": "What is this course about?",
      "hi": "यह कोर्स किस बारे में है?",
      "gu": "આ કોર્સ શું છે?"
    },
    "answer": {
      "en": "This course teaches finger math",
      "hi": "यह कोर्स फिंगर मैथ सिखाता है",
      "gu": "આ કોર્સ ફિંગર મેથ શીખવે છે"
    },
    "isFeatured": true,
    "type": "Course"
  }'
```

**Notes:**

- `question.en` and `answer.en` are **required**
- `question.hi`, `question.gu`, `answer.hi`, `answer.gu` are **optional** (can be `null` or omitted)

#### 2. POST Update FAQ

```bash
curl -X POST {{BASE_URL}}/faq/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "faqId": "FAQ_ID_HERE",
    "question": {
      "en": "Updated question in English",
      "hi": "अपडेटेड प्रश्न",
      "gu": "અપડેટેડ પ્રશ્ન"
    },
    "answer": {
      "en": "Updated answer in English",
      "hi": "अपडेटेड उत्तर",
      "gu": "અપડેટેડ જવાબ"
    }
  }'
```

#### 3. DELETE Delete FAQ

```bash
curl -X DELETE {{BASE_URL}}/faq/delete/FAQ_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All FAQs

```bash
curl -X GET "{{BASE_URL}}/faq/all?page=1&limit=10&search=course&type=Course&isFeatured=true&startDate=2024-01-01&endDate=2024-12-31"
```

**Note:** `search` queries across all 3 languages for both question and answer.

#### 5. GET Get FAQ By ID

```bash
curl -X GET {{BASE_URL}}/faq/FAQ_ID_HERE
```

---

### Newsletter APIs

#### 1. POST Subscribe Newsletter

```bash
curl -X POST {{BASE_URL}}/newsletter/add \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### 2. DELETE Unsubscribe Newsletter

```bash
curl -X DELETE {{BASE_URL}}/newsletter/delete/NEWSLETTER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 3. GET Get All Newsletter Subscriptions

```bash
curl -X GET "{{BASE_URL}}/newsletter/all?page=1&limit=10&search=user@example.com&startDate=2024-01-01&endDate=2024-12-31" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get Newsletter By ID

```bash
curl -X GET {{BASE_URL}}/newsletter/NEWSLETTER_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

---

### Gallery APIs

#### 1. POST Add Gallery

```bash
curl -X POST {{BASE_URL}}/gallery/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    "title": "Event Gallery",
    "description": "Photos from our event"
  }'
```

#### 2. POST Update Gallery

```bash
curl -X POST {{BASE_URL}}/gallery/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "galleryId": "GALLERY_ID_HERE",
    "title": "Updated Gallery Title"
  }'
```

#### 3. DELETE Delete Gallery

```bash
curl -X DELETE {{BASE_URL}}/gallery/delete/GALLERY_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Galleries

```bash
curl -X GET "{{BASE_URL}}/gallery/all?page=1&limit=10&search=event&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Gallery By ID

```bash
curl -X GET {{BASE_URL}}/gallery/GALLERY_ID_HERE
```

---

### Legality APIs

#### 1. POST Add Legality

```bash
curl -X POST {{BASE_URL}}/legality/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "type": "TermsCondition",
    "content": "Terms and conditions content here..."
  }'
```

#### 2. POST Update Legality

```bash
curl -X POST {{BASE_URL}}/legality/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "legalityId": "LEGALITY_ID_HERE",
    "content": "Updated content..."
  }'
```

#### 3. GET Get All Legalities

```bash
curl -X GET "{{BASE_URL}}/legality/all?page=1&limit=10&type=TermsCondition&startDate=2024-01-01&endDate=2024-12-31"
```

#### 4. GET Get Legality By ID

```bash
curl -X GET {{BASE_URL}}/legality/LEGALITY_ID_HERE
```

#### 5. GET Get Legality By Type

```bash
curl -X GET {{BASE_URL}}/legality/type/TermsCondition
```

---

### Get In Touch APIs

#### 1. POST Add Contact Message

```bash
curl -X POST {{BASE_URL}}/get-in-touch/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "subject": "Inquiry",
    "message": "I have a question about your services"
  }'
```

#### 2. POST Update Contact Message

```bash
curl -X POST {{BASE_URL}}/get-in-touch/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "getInTouchId": "CONTACT_ID_HERE",
    "isRead": true
  }'
```

#### 3. DELETE Delete Contact Message

```bash
curl -X DELETE {{BASE_URL}}/get-in-touch/delete/CONTACT_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Contact Messages

```bash
curl -X GET "{{BASE_URL}}/get-in-touch/all?page=1&limit=10&search=john&isRead=false&startDate=2024-01-01&endDate=2024-12-31" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 5. GET Get Contact Message By ID

```bash
curl -X GET {{BASE_URL}}/get-in-touch/CONTACT_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

---

### Workshop APIs

#### 1. POST Add Workshop

```bash
curl -X POST {{BASE_URL}}/workshop/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "image": "https://example.com/workshop.jpg",
    "title": "Advanced React Workshop",
    "subTitle": "Learn React in depth",
    "about": "Comprehensive React workshop",
    "price": 199.99,
    "mrpPrice": 299.99,
    "language": "English",
    "duration": "40 hours"
  }'
```

#### 2. POST Update Workshop

```bash
curl -X POST {{BASE_URL}}/workshop/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "workshopId": "WORKSHOP_ID_HERE",
    "title": "Updated Workshop Title",
    "price": 249.99
  }'
```

#### 3. DELETE Delete Workshop

```bash
curl -X DELETE {{BASE_URL}}/workshop/delete/WORKSHOP_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Workshops

```bash
curl -X GET "{{BASE_URL}}/workshop/all?page=1&limit=10&search=react&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Workshop By ID

```bash
curl -X GET {{BASE_URL}}/workshop/WORKSHOP_ID_HERE
```

#### 6. POST Purchase Workshop

```bash
curl -X POST {{BASE_URL}}/workshop/purchase \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_USER_TOKEN_HERE" \
  -d '{
    "workshop_id": "WORKSHOP_ID_HERE",
    "amount": 199.99,
    "payment_id": "PAYMENT_ID_HERE",
    "payment_method": "razorpay",
    "final_amount": 199.99
  }'
```

#### 7. GET Get My Workshops

```bash
curl -X GET "{{BASE_URL}}/workshop/my-workshops?page=1&limit=10" \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

---

### Workshop Curriculum APIs

#### 1. POST Add Workshop Curriculum

```bash
curl -X POST {{BASE_URL}}/workshop-curriculum/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "workshopId": "WORKSHOP_ID_HERE",
    "date": "2024-12-01",
    "thumbnail": "https://example.com/thumb.jpg",
    "videoLink": "https://example.com/video.mp4",
    "title": "Introduction to React",
    "description": "Learn the basics",
    "duration": "2 hours",
    "attachment": "https://example.com/notes.pdf"
  }'
```

#### 2. POST Update Workshop Curriculum

```bash
curl -X POST {{BASE_URL}}/workshop-curriculum/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "workshopCurriculumId": "CURRICULUM_ID_HERE",
    "title": "Updated Title",
    "duration": "3 hours"
  }'
```

#### 3. DELETE Delete Workshop Curriculum

```bash
curl -X DELETE {{BASE_URL}}/workshop-curriculum/delete/CURRICULUM_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Workshop Curriculums

```bash
curl -X GET "{{BASE_URL}}/workshop-curriculum/all?page=1&limit=10&workshopId=WORKSHOP_ID_HERE&search=react&startDate=2024-01-01&endDate=2024-12-31"
```

#### 5. GET Get Workshop Curriculum By ID

```bash
curl -X GET {{BASE_URL}}/workshop-curriculum/CURRICULUM_ID_HERE
```

---

### Question APIs

> Questions are a reusable pool for finger-math exams. Questions can be of type: `calculation`, `image`, `audio`, or `text`. Each question has a `priority` field for ordering within an exam.

#### 1. POST Add Question

```bash
curl -X POST {{BASE_URL}}/question/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "courseId": "COURSE_ID_HERE",
    "questionText": "What is 3 + 5 using finger math?",
    "questionImage": null,
    "questionAudio": null,
    "questionType": "calculation",
    "correctAnswer": "8",
    "score": 2,
    "priority": 1
  }'
```

#### 2. POST Edit Question

```bash
curl -X POST {{BASE_URL}}/question/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "questionId": "QUESTION_ID_HERE",
    "questionText": "What is 4 + 6 using finger math?",
    "correctAnswer": "10",
    "score": 3,
    "priority": 2
  }'
```

#### 3. DELETE Delete Question

```bash
curl -X DELETE {{BASE_URL}}/question/delete/QUESTION_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Questions

```bash
curl -X GET "{{BASE_URL}}/question/all?page=1&limit=10&courseId=COURSE_ID_HERE&questionType=calculation&search=finger"
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | Number | Page number for pagination |
| limit | Number | Items per page |
| courseId | String | Filter by course |
| questionType | String | Filter by type: `calculation`, `image`, `audio`, `text` |
| search | String | Search in questionText |

**Response includes:** Questions sorted by `priority` (ascending), then `createdAt` (descending).

---

### Exam APIs

> Exams are linked to a specific course lesson. Each exam has a `timeLimit` (in seconds) for the entire exam, `passingMarks`, and `totalMarks`. Admin can select existing questions (`questionIds`) and/or create new questions inline (`newQuestions`) when creating or editing an exam.

#### 1. POST Add Exam

```bash
curl -X POST {{BASE_URL}}/exam/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "courseId": "COURSE_ID_HERE",
    "courseLessonId": "LESSON_ID_HERE",
    "title": "Lesson 1 - Finger Math Basics Exam",
    "description": "Test your understanding of basic finger math",
    "questionIds": ["QUESTION_ID_1", "QUESTION_ID_2"],
    "newQuestions": [
      {
        "questionText": "Show 7 using fingers - what does it look like?",
        "questionType": "image",
        "questionImage": "https://example.com/fingers-7.jpg",
        "correctAnswer": "7",
        "score": 1,
        "priority": 3
      }
    ],
    "passingMarks": 6,
    "totalMarks": 10,
    "timeLimit": 300
  }'
```

**Notes:**

- `questionIds`: Array of existing question IDs to link to this exam
- `newQuestions`: Array of new questions to create inline and auto-link to this exam (they are also added to the question pool with the same `courseId`)
- Both `questionIds` and `newQuestions` can be used together
- `timeLimit`: Time limit for the **entire exam** in seconds (e.g., 300 = 5 minutes)

#### 2. POST Edit Exam

```bash
curl -X POST {{BASE_URL}}/exam/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "examId": "EXAM_ID_HERE",
    "title": "Updated Exam Title",
    "questionIds": ["QUESTION_ID_1", "QUESTION_ID_2", "QUESTION_ID_3"],
    "passingMarks": 7,
    "totalMarks": 12,
    "timeLimit": 600
  }'
```

#### 3. DELETE Delete Exam

```bash
curl -X DELETE {{BASE_URL}}/exam/delete/EXAM_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Exams

```bash
curl -X GET "{{BASE_URL}}/exam/all?page=1&limit=10&courseId=COURSE_ID_HERE&courseLessonId=LESSON_ID_HERE&search=basics"
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | Number | Page number for pagination |
| limit | Number | Items per page |
| courseId | String | Filter by course |
| courseLessonId | String | Filter by lesson |
| search | String | Search in title/description |

**Response:** Exams with populated `questionIds` (sorted by priority), `courseId`, and `courseLessonId`.

#### 5. GET Get Exam By ID

```bash
curl -X GET {{BASE_URL}}/exam/EXAM_ID_HERE
```

**Response:** Exam with fully populated questions (sorted by priority), course, and lesson details.

#### 6. POST Submit Exam

```bash
curl -X POST {{BASE_URL}}/exam/submit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_USER_TOKEN_HERE" \
  -d '{
    "examId": "EXAM_ID_HERE",
    "answers": [
      { "questionId": "QUESTION_ID_1", "answer": "8" },
      { "questionId": "QUESTION_ID_2", "answer": "15" },
      { "questionId": "QUESTION_ID_3", "answer": "7" }
    ],
    "timeTaken": 245
  }'
```

**Notes:**

- `timeTaken`: Time taken by the student for the **entire exam** in seconds
- The server grades each answer by comparing with `correctAnswer` (case-insensitive, trimmed)
- **Multiple attempts:** Re-submitting the same exam updates the existing attempt record (upsert). A new document is NOT created. The `attemptCount` is incremented.
- **Response:** Returns the attempt object with `obtainedMarks`, `totalMarks`, `status` (`pass`/`fail`), `attemptCount`, and graded `answers` (each with `isCorrect`)

**Example Response:**

```json
{
  "status": 200,
  "message": "Exam submitted successfully! Status: pass",
  "data": {
    "_id": "ATTEMPT_ID",
    "userId": "USER_ID",
    "examId": "EXAM_ID",
    "courseId": "COURSE_ID",
    "courseLessonId": "LESSON_ID",
    "answers": [
      { "questionId": "Q1_ID", "answer": "8", "isCorrect": true },
      { "questionId": "Q2_ID", "answer": "15", "isCorrect": true },
      { "questionId": "Q3_ID", "answer": "7", "isCorrect": true }
    ],
    "obtainedMarks": 6,
    "totalMarks": 10,
    "timeTaken": 245,
    "status": "pass",
    "attemptCount": 2,
    "isCompleted": true
  }
}
```

#### 7. GET Get User Exam Attempts

```bash
curl -X GET "{{BASE_URL}}/exam/attempts?page=1&limit=10&courseId=COURSE_ID_HERE&examId=EXAM_ID_HERE" \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | Number | Page number for pagination |
| limit | Number | Items per page |
| courseId | String | Filter by course |
| examId | String | Filter by specific exam |

**Response:** User's attempt history with populated exam, lesson, and course info.

---

### Course Lesson APIs (Updated)

> Lessons now include a `practiceMaterial` field (PDF/file link) and `isUnlocked` status based on the user's exam progress. **Lesson unlock logic:** The first lesson (lowest priority) is always unlocked. Subsequent lessons require the previous lesson's exam to be passed. If a lesson has no exam, the next one is automatically unlocked.

#### 1. POST Add Course Lesson

```bash
curl -X POST {{BASE_URL}}/course-lesson/add \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "courseId": "COURSE_ID_HERE",
    "title": "Lesson 1 - Finger Math Basics",
    "subtitle": "Introduction to counting with fingers",
    "priority": 1,
    "practiceMaterial": "https://example.com/practice-sheet-1.pdf",
    "lessonLock": false
  }'
```

#### 2. POST Edit Course Lesson

```bash
curl -X POST {{BASE_URL}}/course-lesson/edit \
  -H "Content-Type: application/json" \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "courseLessonId": "LESSON_ID_HERE",
    "title": "Updated Lesson Title",
    "practiceMaterial": "https://example.com/updated-practice.pdf",
    "priority": 2
  }'
```

#### 3. DELETE Delete Course Lesson

```bash
curl -X DELETE {{BASE_URL}}/course-lesson/delete/LESSON_ID_HERE \
  -H "authorization: YOUR_ADMIN_TOKEN_HERE"
```

#### 4. GET Get All Course Lessons

```bash
curl -X GET "{{BASE_URL}}/course-lesson/all?page=1&limit=10&courseId=COURSE_ID_HERE&search=basics&startDate=2024-01-01&endDate=2024-12-31" \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

**Response:** Each lesson includes `isUnlocked: true/false` based on exam progress.

**Example Response:**

```json
{
  "status": 200,
  "message": "Course lessons successfully retrieved!",
  "data": {
    "course_lesson_data": [
      {
        "_id": "LESSON_1_ID",
        "title": "Lesson 1 - Finger Math Basics",
        "priority": 1,
        "practiceMaterial": "https://example.com/practice-sheet-1.pdf",
        "isUnlocked": true
      },
      {
        "_id": "LESSON_2_ID",
        "title": "Lesson 2 - Addition",
        "priority": 2,
        "practiceMaterial": "https://example.com/practice-sheet-2.pdf",
        "isUnlocked": false
      }
    ],
    "totalData": 2,
    "state": { "page": 1, "limit": 2, "page_limit": 1 }
  }
}
```

#### 5. GET Get Course Lesson By ID

```bash
curl -X GET {{BASE_URL}}/course-lesson/LESSON_ID_HERE \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

**Note:** Returns `403 Forbidden` if the lesson is locked for the authenticated user.

**Error Response (locked lesson):**

```json
{
  "status": 403,
  "message": "This lesson is locked. Please complete the previous lesson's exam first.",
  "data": {},
  "error": {}
}
```

---

### Course Curriculum APIs (Updated)

> Curriculum endpoints now return `isUnlocked` and `practiceMaterial` for each lesson in `courseLessonsAssigned`. The unlock logic is the same as Course Lesson APIs.

#### GET Get All Course Curriculums

```bash
curl -X GET "{{BASE_URL}}/course-curriculum/all?page=1&limit=10&courseId=COURSE_ID_HERE&courseLessonId=LESSON_ID_HERE&search=basics&startDate=2024-01-01&endDate=2024-12-31" \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

**Response:** Each curriculum's `courseLessonsAssigned` array now includes `isUnlocked` and `practiceMaterial` per lesson.

#### GET Get Course Curriculum By ID

```bash
curl -X GET {{BASE_URL}}/course-curriculum/CURRICULUM_ID_HERE \
  -H "authorization: YOUR_USER_TOKEN_HERE"
```

**Response:** Same as above — lessons include `isUnlocked` and `practiceMaterial`.

---

### Course APIs (Updated Fields)

> Courses now support `courseLessonIds` to directly hold lessons without needing a curriculum layer. `courseCurriculumIds` is now optional.

**New field in Add/Edit Course:**

```json
{
  "courseLessonIds": ["LESSON_ID_1", "LESSON_ID_2", "LESSON_ID_3"]
}
```

This allows a course to hold lessons directly. When merging courses, each sub-course becomes a curriculum under the parent course.

---

## Notes

1. **Authentication Tokens:**
   - Replace `YOUR_TOKEN_HERE` with the actual JWT token received from login/signup
   - Replace `YOUR_ADMIN_TOKEN_HERE` with admin JWT token
   - Replace `YOUR_USER_TOKEN_HERE` with user JWT token

2. **Base URL:**
   - Replace `localhost:PORT` with your actual server URL and port
   - Example: `http://localhost:3000` or `https://api.example.com`

3. **IDs:**
   - Replace placeholder IDs (like `USER_ID_HERE`, `BLOG_ID_HERE`, etc.) with actual MongoDB ObjectIds

4. **Query Parameters:**
   - All query parameters are optional
   - `page` and `limit` are used for pagination
   - `search` is used for searching across relevant fields
   - `startDate` and `endDate` should be in format: `YYYY-MM-DD`

5. **Required Headers:**
   - `Content-Type: application/json` for POST/PUT requests
   - `authorization: TOKEN` for protected routes (adminJWT or userJWT)

6. **Exam & Lesson Progression:**
   - `timeLimit` and `timeTaken` are in **seconds**
   - Lesson unlock is computed at read-time based on exam attempt status
   - Multiple exam submissions **update** the same attempt record (upsert)
   - Question types: `calculation`, `image`, `audio`, `text`
