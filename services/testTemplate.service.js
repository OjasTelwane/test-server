/*******************************************************************************************************
 * Test Template Service currently Loading and Saving Data from Mongo Db file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 12/10/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const TestTemplate = require('../models/TestTemplate');
const ApiError = require('../middleware/api.error');

const testService = require('./test.service');
const testQuestionService = require('./testQuestion.service');

// exports.assign = async (id, examineeId, examineeName, res, next) => {
//   try {
//     console.log('assign==>', id);
//     const testTemplate = await TestTemplate.findById(id).populate('questions');
//     if (testTemplate === null) {
//       console.log('fassign==>before Error return', testTemplate);
//       next(ApiError.notFound('Not found: Test Template with id=' + id));
//       return;
//     } else {
//       var test = {
//         examineeId: examineeId,
//         examineeName: examineeName,
//         testTemplateId: id,
//         testName: testTemplate.testName,
//         testType: testTemplate.testType,
//         status: 'Assigned',
//         testDescription: testTemplate.testDescription,
//         testDuration: testTemplate.testDuration,
//         testDate: testTemplate.testDate,
//         startTime: testTemplate.startTime,
//         endTime: testTemplate.endTime,
//         tags: testTemplate.tags,
//         tagsBucket: testTemplate.tagsBucket,
//         // testAttended: false,
//         score: {
//           totalQuestions: testTemplate.isManual
//             ? testTemplate.questions.length
//             : 0,
//           totalAnswered: 0,
//           totalNotAnswered: testTemplate.isManual
//             ? testTemplate.questions.length
//             : 0,
//           totalMarkedForReview: 0,
//           totalCorrectAnswered: 0,
//         },
//         questions: [],
//       };
//       const retTest = await testService.create(test, res, next);
//       const testId = retTest.id;
//       if (!testTemplate.isManual) {
//         //Emit Event
//         const eventEmitter = req.app.get('eventEmitter');
//         eventEmitter.emit('onTestAssign', retTest);
//       }
//       if (testTemplate.isManual) {
//         console.log(
//           'testTemplate.questions===>',
//           testTemplate.questions.length
//         );
//         const testQuestions = testTemplate.questions.map((question) => {
//           return {
//             testId: testId,
//             questionType: question.questionType,
//             text: question.text,
//             status: 'Assigned',
//             tags: question.tags,
//             tagsBucket: question.tagsBucket,
//             files: question.files,
//             selections: question.selections,
//             options: question.options.map((option) => {
//               return {
//                 setNo: option.setNo,
//                 orderNo: option.orderNo,
//                 isCorrect: option.isCorrect,
//                 text: option.text,
//                 files: option.files,
//                 selections: option.selections,
//                 tags: option.tags,
//                 selectedOption: false,
//                 selectedOrderNo: 0,
//                 isCorrectOption: false,
//               };
//             }),
//           };
//         });
//         if (testQuestions && testQuestions.length > 0) {
//           testQuestionService.createBatch(testQuestions, res, next);
//         }
//       }
//       res.status(200).send(retTest);
//     }
//   } catch (err) {
//     next(ApiError.internalError(err));
//     return;
//   }
// };

exports.findById = async (id) => {
  try {
    console.log('findById==>', id);
    const data = await TestTemplate.findById(id).populate('questions');
    if (data === null) {
      console.log('findById==>before Error return', data);
      return;
    } else {
      return data;
    }
  } catch (err) {
    return;
  }
};

exports.findQuestion = async (
  testTemplateId,
  questionType,
  tags,
  excludeIds
) => {
  try {
    const testTemplateIds = [];
    testTemplateIds.push(testTemplateId);
    // console.log('questions.tagsBucket.tag==>', tags);
    const condition = {
      _id: { $in: testTemplateIds !== undefined ? testTemplateIds : [] },
      // questionType: {
      //   $in: questionType !== undefined ? questionType : [0, 1, 2, 3],
      // },
      'questions.id': { $nin: excludeIds !== undefined ? excludeIds : [] },
      'questions.tagsBucket.tag': {
        $in: tags !== undefined ? tags : new RegExp(''),
      },
    };
    console.log('findQuestion==condition===>', condition);
    const data = await TestTemplate.find(condition)
      .populate({
        path: 'questions',
      })
      .exec(function (err, tests) {
        // console.log('err==>', err);
        // console.log('tests==>', tests);
        if (tests && tests.length > 0) {
          const t = tests[0];
          if (t.questions && t.questions.length > 0) {
            const question = t.questions[0];
            console.log('returning==>question', question);
            return question;
          }
        }
        return null;
        // populated and filtered twice
      });

    if (data === null) {
      console.log('findQuestion==>before Error return');
      return;
    } else {
      console.log('findQuestion==>data', data);
      if (data.length > 0) {
        const questions = data[0].questions;
        console.log('findQuestion==>questions', questions);
        if (questions.length > 0) {
          console.log('returning==>question', questions[0]);
          return questions[0];
        }
      }
      return null;
    }
  } catch (err) {
    return;
  }
};
