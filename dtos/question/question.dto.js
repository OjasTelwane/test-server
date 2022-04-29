/*******************************************************************************************************
 * Question Dto and Question Query Parameter Dtos file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 15/09/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const yup = require('yup');

const question = require('../common/question.dto');
const selection = require('../common/selection.dto');
const file = require('../common/files.dto');
const option = require('../common/option.dto');

const questionDto = yup.object().shape({
  question,
  isActive: yup.boolean().default(false),
  isVerified: yup.boolean(),
  verifiedBy: yup.string(),
  createdBy: yup.string(),
  modifiedBy: yup.string(),
  tags: yup.array(),
  file: yup.array().of(file),
  selections: yup.array().of(selection),
  options: yup.array().of(option),
});

const questionDtos = yup.array().of(questionDto);

const questionParam = yup.object().shape({
  text: yup.string(),
  tag: yup.string(),
  optionText: yup.string(),
  optionTag: yup.string(),
});

const questionPageParam = yup.object().shape({
  questionParam,
  page: yup.number(),
  size: yup.number(),
});

module.exports = {
  questionDto,
  questionDtos,
  questionParam,
  questionPageParam,
};
