import mongoose from 'mongoose';
import { examModel } from './database/models/exam';
import { questionModel } from './database/models/question';

const DB_URL = 'mongodb+srv://pramit:pramit%4097250@cluster0.diyx50x.mongodb.net/shining-sparrow-BE';
const EXAM_ID = '6a33dd50a5daf53112576c4b';

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DB_URL);
    console.log('Connected!');

    // Find the target exam
    const exam = await examModel.findById(EXAM_ID);
    if (!exam) {
      console.error('Exam not found!');
      process.exit(1);
    }
    console.log('Found Exam:', exam.title, 'Course:', exam.courseId);

    // Delete any old questions linked to this exam to keep it clean
    if (exam.questionIds && exam.questionIds.length > 0) {
      console.log(`Deleting ${exam.questionIds.length} old questions...`);
      await questionModel.deleteMany({ _id: { $in: exam.questionIds } });
    }

    // Define 4 calculation reference questions
    const questionData = [
      {
        courseId: exam.courseId,
        questionType: 'calculation',
        questionText: '29\n27\n-21\n22\n16', // Vertical format, auto-detected by newline
        correctAnswer: '73',
        score: 1,
        priority: 1
      },
      {
        courseId: exam.courseId,
        questionType: 'calculation',
        questionText: '10 5 -3 +8 -2', // Horizontal format, single-line
        correctAnswer: '18',
        score: 1,
        priority: 2
      },
      {
        courseId: exam.courseId,
        questionType: 'calculation',
        questionText: '+15\n-8\n+12\n+5\n-3', // Vertical layout with explicit signs
        correctAnswer: '21',
        score: 1,
        priority: 3
      },
      {
        courseId: exam.courseId,
        questionType: 'calculation',
        questionText: '100 50 -20 10', // Horizontal layout
        correctAnswer: '140',
        score: 1,
        priority: 4
      }
    ];

    console.log('Creating new calculation reference questions...');
    const createdQuestions = await questionModel.create(questionData);
    const newQuestionIds = createdQuestions.map((q: any) => q._id);

    // Update Exam
    exam.questionIds = newQuestionIds;
    exam.totalMarks = createdQuestions.length; // 4 Marks
    exam.passingMarks = 2; // 2 Marks to pass
    await exam.save();

    console.log('Exam updated successfully with 4 calculation questions!');
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

seed();
