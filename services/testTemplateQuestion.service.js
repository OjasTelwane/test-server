/*******************************************************************************************************
 * Test Template Questions Service currently Loading and Saving Data from Mongo Db file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 12/10/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const TestTemplateQuestion = require('../models/TestTemplateQuestion');
const ApiError = require('../middleware/api.error');

exports.create = async (testTemplateQuestionDto, res, next) => {
  try {
    const newTestTemplateQuestion = new TestTemplateQuestion(
      testTemplateQuestionDto
    );
    const data = await newTestTemplateQuestion.save();
    if (!data) {
      next(ApiError.badRequest('Error in Test Template Question Insert!'));
      return;
    } else {
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.createBatch = async (testTemplateQuestionDtos, res, next) => {
  try {
    const data = await TestTemplateQuestion.insertMany(
      testTemplateQuestionDtos,
      {
        ordered: false,
      }
    );
    if (!data) {
      next(
        ApiError.badRequest('Error in Test Template Questions Batch Insert!')
      );
      return;
    } else {
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.update = async (id, testTemplateQuestionDto, res, next) => {
  try {
    const data = await TestTemplateQuestion.findByIdAndUpdate(
      id,
      testTemplateQuestionDto,
      {
        useFindAndModify: false,
      }
    );
    if (!data) {
      next(
        ApiError.notFound(
          'Cannot update Test Template Question with id==' +
            id +
            ' Maybe Test Template Question was not found!'
        )
      );
      return;
    } else {
      // res.status(200).send(data);
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.delete = async (id, res, next) => {
  try {
    TestTemplateQuestion.findByIdAndRemove(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          next(
            ApiError.notFound(
              'Cannot delete Test Template Question with id=' +
                id +
                ' Maybe Test Template Question was not found!'
            )
          );
          return;
        } else {
          res.send({
            message: 'Test Template Question was deleted successfully!',
            testQuestion: data,
          });
        }
      })
      .catch((err) => {
        next(
          ApiError.internalError(
            err,
            'Could not delete Test Template Question with id=' + id
          )
        );
        return;
      });
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.findById = async (id, res, next, sendData = true) => {
  try {
    console.log('findById==>', id);
    const data = await TestTemplateQuestion.findById(id);
    if (data === null) {
      console.log('findById==>before Error return', data);
      if (sendData) {
        next(ApiError.notFound('Not found: Test Question with id=' + id));
      }
      return;
    } else {
      if (sendData) {
        res.send(data);
      } else {
        return data;
      }
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.findAll = async (condition) => {
  try {
    const data = await TestTemplateQuestion.find(condition);
    if (!data) {
      // next(
      //   ApiError.internalError(
      //     err,
      //     'Some error occurred while retrieving Test Template Questions'
      //   )
      // );
      return;
    } else {
      return data;
    }
  } catch (err) {
    // next(ApiError.internalError(err));
    return;
  }
};

exports.findAllPaginate = async (condition, sort, limit, offset) => {
  try {
    const data = await TestTemplateQuestion.paginate(condition, sort, {
      offset,
      limit,
    });
    if (!data) {
      return;
    }
    // console.log('data==>', data);
    return data.docs;
  } catch (err) {
    console.log('err', err);
    // next(ApiError.internalError(err));
    return;
  }
};
