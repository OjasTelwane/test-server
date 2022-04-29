/*******************************************************************************************************
 * Test Dto and Test Query Parameter Dtos file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 27/09/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const yup = require('yup');
const test = require('../common/test.dto');
// const question = require('../common/question.dto');
// const tag = require('../common/tag.dto');
// const selection = require('../common/selection.dto');
// const file = require('../common/files.dto');
// const option = require('../common/option.dto');

const testDto = yup.object().shape({
  examineeId: yup.string(),
  examineeName: yup.string(),
  test,
  status: yup.string(),
  maxAttempt: yup.number(),
  isManual: yup.boolean().default(false),
  score: yup.object().shape({
    totalQuestions: yup.number().default(0),
    totalAnswered: yup.number().default(0),
    totalNotAnswered: yup.number().default(0),
    totalMarkedForReview: yup.number().default(0),
    totalCorrectAnswered: yup.number().default(0),
  }),
  questions: yup.array().of(yup.string()),
});

const testParam = yup.object().shape({
  examineeId: yup.string(),
});

const testPageParam = yup.object().shape({
  examineeId: yup.string(),
  page: yup.number(),
  size: yup.number(),
});

module.exports = { testDto, testParam, testPageParam };
