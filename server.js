const express = require('express');
const compression = require('compression');
const databaseConnection = require('./config/db');
const http = require('http');
const api = require('./api');
const cors = require('cors');
const apiErrorHandler = require('./middleware/api.error.handler');
const testTemplateService = require('./services/testTemplate.service');
const testTemplateQuestionService = require('./services/testTemplateQuestion.service');
const testService = require('./services/test.service');
const testQuestionService = require('./services/testQuestion.service');
// Authenticate before we execute the end point
const auth = require('./middleware/auth');

const Emitter = require('events');

const app = express();
const port = process.env.PORT || 8081;

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ extended: false, limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('assets'));
app.use(express.static(__dirname + '/'));

databaseConnection();

// Routes
app.use(api);
//middleware where we handle all errors, trapped and un-trapped
// Always call this Error Handler at the last
app.use(apiErrorHandler);

const server = http.createServer(app);

const io = require('socket.io-client');

const socket = io.connect('http://localhost:8080', {
  reconnect: true,
  rejectUnauthorized: false,
  transports: ['websocket'],
});
if (socket) {
  socket.on('connect', () => {
    console.log('You are connected with Id==>', socket.id);
    socket.emit('joinServer', 'TestServer');
    console.log('sent joinServer', 'TestServer');
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to}`, err.message);
  });

  const updateQuestionResults = async (
    testId,
    numberOfAttempts,
    oldIsCorrect,
    isCorrect,
    questionType,
    oldTagsBucket,
    tagsBucket
  ) => {
    try {
      const test = await testService.findById(testId);

      if (numberOfAttempts <= 1) {
        test.score.totalAnswered = test.score.totalAnswered + 1;
        test.score.totalNotAnswered =
          test.score.totalQuestions - test.score.totalAnswered;
      }

      if (oldIsCorrect === true || questionType === 3) {
        // Evaluation
        test.score.totalCorrectAnswered = test.score.totalCorrectAnswered - 1;
        const newTagsBucket = test.tagsBucket.map((tag) => {
          const tbTags = oldTagsBucket.filter((tb) => {
            return tb.tag === tag.tag;
          });
          console.log('tbTags==>', tbTags);

          if (tbTags && tbTags.length > 0) {
            const count = tag.count - tbTags[0].count;
            return {
              tag: tag.tag,
              count: count,
              order: tag.order,
              level: tag.level,
              weightage: tag.weightage,
              // weightage: tag.weightage - tbTags[0].weightage,
              questionCount: tag.questionCount - 1,
              answerCount: tag.answerCount,
              finalWeghtage: count * tag.order * tag.level * tag.weightage,
              // finalWeghtage: tag.finalWeghtage - tag.finalWeghtage,
            };
          } else {
            return tag;
          }
        });
        console.log('newTagsBucket==>', newTagsBucket);
        test.tagsBucket = newTagsBucket;
      }
      // if (numberOfAttempts > 1) {
      //   test.tags.map((tag) => {
      //     const tbTags = oldTagsBucket.filter((tb) => {
      //       return tb.tag === tag.tag;
      //     });
      //     if (tbTags && tbTags.length > 0) {
      //       return {
      //         tag: tag.tag,
      //         questionCount: tag.questionCount - 1,
      //         count: tag.count,
      //         weightage: tag.weightage,
      //       };
      //     }
      //   });
      // }

      if (isCorrect || questionType === 3) {
        // Evaluation

        test.score.totalCorrectAnswered = test.score.totalCorrectAnswered + 1;

        const newTagsBucket = test.tagsBucket.map((tag) => {
          const tbTags = tagsBucket.filter((tb) => {
            return tb.tag === tag.tag;
          });

          console.log('tbTags==>', tbTags);
          if (tbTags && tbTags.length > 0) {
            const tagCount = Number(tag.count) + Number(tbTags[0].count);
            return {
              tag: tag.tag,
              count: tagCount,
              order: tag.order,
              level: tag.level,
              weightage: tag.weightage,
              // weightage: tag.weightage + tbTags[0].weightage,
              questionCount: tag.questionCount + 1,
              answerCount: tag.answerCount + 1,
              finalWeghtage: tagCount * tag.order * tag.level * tag.weightage,
            };
          } else {
            return tag;
          }
        });
        console.log('newTagsBucket==>', newTagsBucket);
        test.tagsBucket = newTagsBucket;
      }

      // test.tagsBucket.map((tag) => {
      //   const tbTags = oldTagsBucket.filter((tb) => {
      //     return tb.tag === tag.tag;
      //   });
      //   if (tbTags && tbTags.length > 0) {
      //     return {
      //       tag: tag.tag,
      //       questionCount: tag.questionCount + 1,
      //       count: tag.count,
      //       weightage: tag.weightage,
      //     };
      //   }
      // });
      return await testService.update(testId, test);
    } catch (error) {
      console.log('updateQuestionResults==>', error);
      console.log('================================>');
    }
  };

  const addTestQuestion = async (testTemplateId, tag, excludeIds, testId) => {
    try {
      const searchTags = [];
      searchTags.push(tag);
      const condition = {
        testTemplateId: testTemplateId,
        questionId: { $nin: excludeIds !== undefined ? excludeIds : [] },
        'tagsBucket.tag': {
          $in: searchTags !== undefined ? searchTags : new RegExp(''),
        },
      };
      // console.log('condition==>', condition);
      const sort = [
        { 'tagsBucket.count': -1 },
        { 'tagsBucket.finalWeightage': -1 },
        { 'tagsBucket.level': 1 },
        { 'tagsBucket.tag': 1 },
      ];
      // console.log('sort==>', sort);
      const questions = await testTemplateQuestionService.findAllPaginate(
        condition,
        sort,
        0,
        5
      );
      // console.log('found=questions==>', questions.length);
      if (questions && questions.length > 0) {
        // select Random question from returned 5 questions
        const randomQuestion = Math.floor(Math.random() * questions.length);
        const question =
          questions && questions.length > 0
            ? questions[randomQuestion]
            : undefined;
        // console.log('selected=question==>', question);
        if (question) {
          const testQuestion = {
            testId: testId,
            testTemplateId: question.testTemplateId,
            status: 'Assigned',
            questionId: question.questionId,
            questionType: question.questionType,
            text: question.text,
            files: question.files,
            selections: question.selections,
            tags: question.tags,
            tagsBucket: question.tagsBucket,
            tagsExtraBucket: question.tagsExtraBucket,
            options: question.options.map((option) => {
              return {
                setNo: option.setNo,
                orderNo: option.orderNo,
                isCorrect: option.isCorrect,
                text: option.text,
                files: option.files,
                selections: option.selections,
                tags: option.tags,
                selectedOption: false,
                selectedOrderNo: 0,
                isCorrectOption: false,
              };
            }),
          };
          const test = await testService.findById(testId);
          test.tagsBucket.map((tag) => {
            const tbTags = question.tagsBucket.filter((tb) => {
              return tb.tag === tag.tag;
            });
            if (tbTags && tbTags.length > 0) {
              const count = tag.count + tbTags[0].count;
              const finalWeghtage = tag.finalWeghtage + tbTags[0].finalWeghtage;
              return {
                tag: tag.tag,
                count: count,
                order: tag.order,
                level: tag.level,
                weightage: tag.weightage,
                // weightage: tag.weightage + tbTags[0].weightage,
                questionCount: tag.questionCount + 1,
                answerCount: tag.answerCount + 1,
                finalWeghtage: finalWeghtage,
              };
            }
          });
          // console.log('creating=testQuestion==>', testQuestion);
          const retTestQuestion = await testQuestionService.create(
            testQuestion
          );

          // console.log('creating=retTestQuestion==>', retTestQuestion);
          return retTestQuestion;
        } else {
          return;
        }
      }
      return;
    } catch (error) {
      console.log('================================>');
      console.log('addTestQuestion==>', error);
      console.log('================================>');
    }
  };

  const getExcludeQuestionIds = async (id) => {
    try {
      // console.log('test=tags==>', tags);
      const condition = {
        testId: id,
      };
      const testQuestionList = await testQuestionService.findAll(condition);
      let excludeIds = [];
      if (testQuestionList) {
        excludeIds = await testQuestionList.map((q) => {
          // console.log('Question==>', q);
          return q.questionId;
        });
      }
      console.log('================================>');
      console.log('=======test=excludeIds=====>', excludeIds);
      console.log('================================>');
      return excludeIds;
    } catch (error) {
      console.log('================================>');
      console.log('getExcludeQuestionIds==>', error);
      console.log('================================>');
    }
  };

  const processQuestionTag = (testTagsBucket, qt, incDec) => {
    return testTagsBucket.map((tt) => {
      return {
        tag: tt.tag,
        count: qt.tag === tt.tag ? tt.count + incDec * qt.count : tt.count,
        order: tt.order,
        level: tt.level,
        weightage: tt.weightage,
        questionCount:
          qt.tag === tt.tag ? tt.questionCount + incDec : tt.questionCount,
        finalWeghtage: tt.finalWeghtage,
      };
    });
  };

  const processQuestionCountForTags = (tagsBucket, testTagsBucket, incDec) => {
    try {
      for (let qindex = 0; qindex < tagsBucket.length; qindex++) {
        const qt = tagsBucket[qindex];
        testTagsBucket = processQuestionTag(testTagsBucket, qt, incDec);
      }
      return testTagsBucket;
    } catch (error) {
      console.log('================================>');
      console.log('processQuestionCountForTags==>', error);
      console.log('================================>');
    }
  };

  const onQuestionUpdate = async (
    testId,
    questionType,
    isCorrect,
    tagsBucket,
    numberOfAttempts,
    oldIsCorrect,
    oldTagsBucket,
    socket,
    finish
  ) => {
    try {
      const retTest = await updateQuestionResults(
        testId,
        numberOfAttempts,
        oldIsCorrect,
        isCorrect,
        questionType,
        oldTagsBucket,
        tagsBucket
      );
      // console.log('retTest==>', retTest);
      if (retTest.status !== 'Complete') {
        const { testTemplateId } = retTest;
        let retTagsBucket = retTest.tagsBucket;

        // let tag = "";
        // let lowestQuestionCount = 10000;
        // for (let index = 0; index < retTagsBucket.length; index++) {
        //   const tb = retTagsBucket[index];
        //   if (tb.questionCount < lowestQuestionCount) {
        //     lowestQuestionCount = tb.questionCount;
        //     tag = tb.tag;
        //   }
        // }
        retTagsBucket = retTagsBucket.sort(function (a, b) {
          return parseFloat(a.questionCount) - parseFloat(b.questionCount);
        });
        let excludeIds = [...retTest.questions];
        for (let index = 0; index < retTagsBucket.length; index++) {
          const tb = retTagsBucket[index];
          const retTestQuestion = await addTestQuestion(
            testTemplateId,
            tb.tag,
            excludeIds,
            testId
          );
          // if addTestQuestion is success then break out of for loop else continue to next tag
          if (retTestQuestion) {
            if (!finish) {
              socket.emit('onNewQuestion', retTestQuestion);
              console.log(
                'emit===onNewQuestion==============================>Start'
              );
              console.log('emit===onNewQuestion===>', retTestQuestion);
              console.log(
                'emit===onNewQuestion================================>End'
              );
            }
            index = retTagsBucket.length;
          }
        }
        // console.log("lowestQuestionCount and Tag ==>", lowestQuestionCount, tag);
        // if (tag) {
        //   // let excludeIds = await getExcludeQuestionIds(testId);
        //   let excludeIds = [...retTest.questions];
        //   const retTestQuestion = await addTestQuestion(
        //     testTemplateId,
        //     tag,
        //     excludeIds,
        //     testId
        //   );
        //   socket.emit("onNewQuestion", retTestQuestion);
        //   console.log(
        //     "emit===onNewQuestion================================>Start"
        //   );
        //   console.log("emit===onNewQuestion===>", retTestQuestion);
        //   console.log("emit===onNewQuestion================================>End");
        //   // const sort = [
        //   //   { 'tagsBucket.count': -1 },
        //   //   { 'tagsBucket.finalWeightage': -1 },
        //   //   { 'tagsBucket.level': 1 },
        //   //   { 'tagsBucket.tag': 1 },
        //   // ];
        // }
      }
    } catch (error) {
      console.log('================================>');
      console.log('onQuestionUpdate==>', error);
      console.log('================================>');
    }
  };

  socket.on('onQuestionUpdate', (updateQuestion) => {
    try {
      if (!updateQuestion) {
        return;
      }
      const {
        testId,
        questionType,
        isCorrect,
        tagsBucket,
        numberOfAttempts,
        oldIsCorrect,
        oldTagsBucket,
      } = updateQuestion;
      if (testId) {
        onQuestionUpdate(
          testId,
          questionType,
          isCorrect,
          tagsBucket,
          numberOfAttempts,
          oldIsCorrect,
          oldTagsBucket,
          socket,
          false
        );
      }
      // console.log('onQuestionUpdate', updateQuestion);
    } catch (error) {
      console.log('================================>');
      console.log('socket.onQuestionUpdate==>', error);
      console.log('================================>');
    }
  });

  socket.on('onFinishTest', (updateQuestion) => {
    try {
      if (!updateQuestion) {
        return;
      }
      const {
        testId,
        questionType,
        isCorrect,
        tagsBucket,
        numberOfAttempts,
        oldIsCorrect,
        oldTagsBucket,
      } = updateQuestion;
      if (testId) {
        onQuestionUpdate(
          testId,
          questionType,
          isCorrect,
          tagsBucket,
          numberOfAttempts,
          oldIsCorrect,
          oldTagsBucket,
          socket,
          true
        );
      }
      // console.log('onFinishTest', updateQuestion);
    } catch (error) {
      console.log('================================>');
      console.log('socket.onFinishTest==>', error);
      console.log('================================>');
    }
  });

  socket.on('onTestAssign', async (t) => {
    try {
      if (!t) {
        return;
      }

      const { id, testTemplateId } = t;
      // console.log('testTemplateId==>', testTemplateId);
      const test = await testService.findById(id);
      // console.log('onTestAssign=test==>', test);
      if (test) {
        const tags = test.tags;
        // console.log('test=testTemplateId==>', test.testTemplateId);
        // console.log('test=tags==>', tags);
        // let excludeIds = await getExcludeQuestionIds(id);
        let excludeIds = [...test.questions];
        let questionCount = 0;
        const questionType = undefined;
        const questionList = [];
        const questions = [...test.questions];

        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i];

          const retTestQuestion = await addTestQuestion(
            testTemplateId,
            tag,
            excludeIds,
            id
          );
          // console.log('================================>');
          // console.log('=======created=retTestQuestion==>', retTestQuestion);
          // console.log('================================>');
          if (retTestQuestion) {
            questionList.push(retTestQuestion);
            questionCount = questionCount + 1;
            // console.log('================================>');
            // console.log('retTestQuestion.questionId==>', retTestQuestion.questionId);
            // console.log('================================>');
            excludeIds.push(retTestQuestion.questionId);
          }
        }
        let testTagsBucket = [...test.tagsBucket];
        for (let index = 0; index < questionList.length; index++) {
          const question = questionList[index];
          const questionId = question.questionId.toString();
          questions.push(questionId);
          const tagsBucket = [...question.tagsBucket];
          testTagsBucket = processQuestionCountForTags(
            tagsBucket,
            testTagsBucket,
            1
          );
        }
        console.log('================================>');
        console.log('onTestAssign:testTagsBucket==>', testTagsBucket);
        console.log('================================>');
        test.questions = [...questions];
        test.tagsBucket = [...testTagsBucket];
        test.score.totalQuestions = test.score.totalQuestions + questionCount;
        test.score.totalNotAnswered =
          test.score.totalNotAnswered + questionCount;
        console.log('Score=======>', test.score);
        console.log('================================>');
        await testService.update(id, test);
        // tags: yup.array().of(
        //   yup.object().shape({
        //     tag: yup.string(),
        //     questionCount: yup.number().default(0),
        //     count: yup.number(),
        //     level: yup.number(),
        //     weightage: yup.number(),
        //   })
        // ),
      }
    } catch (error) {
      console.log('================================>');
      console.log('onTestAssign==>', error);
      console.log('================================>');
    }
  });
}

// Start Server
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = server;
