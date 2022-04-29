/*******************************************************************************************************
 * Test Template Dto and Test Template Query Parameter Dtos file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 12/10/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const yup = require('yup');
const test = require('../common/test.dto');

const testTemplateDto = yup.object().shape({
  isVerified: yup.string(),
  verifiedBy: yup.string(),
  createdBy: yup.string(),
  modifiedBy: yup.string(),
  testTemplateId: yup.string(),
  test,
  isManual: yup.boolean().default(false),
  questions: yup.array(),
});

const testTemplatePageParam = yup.object().shape({
  testName: yup.string(),
  testType: yup.string(),
  testDescription: yup.string(),
  testDate: yup.string(),
  tag: yup.string(),
  page: yup.number(),
  size: yup.number(),
});

module.exports = {
  testTemplateDto,
  testTemplatePageParam,
};
