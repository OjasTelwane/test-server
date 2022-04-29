/*******************************************************************************************************
 * Test Questions Service currently Loading and Saving Data from Mongo Db file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 12/10/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const TestQuestion = require('../models/TestQuestion');
const ApiError = require('../middleware/api.error');

exports.create = async (testQuestionDto) => {
  try {
    const newTestQuestion = new TestQuestion(testQuestionDto);
    const data = await newTestQuestion.save();
    if (!data) {
      return;
    } else {
      return data;
    }
  } catch (err) {
    return;
  }
};

exports.createBatch = async (testQuestionDtos, res, next) => {
  try {
    const data = await TestQuestion.insertMany(testQuestionDtos, {
      ordered: false,
    });
    if (!data) {
      next(ApiError.badRequest('Error in Test Questions Batch Insert!'));
      return;
    } else {
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.update = async (id, testQuestionDto, res, next) => {
  try {
    const data = await TestQuestion.findByIdAndUpdate(id, testQuestionDto, {
      useFindAndModify: false,
    });
    if (!data) {
      next(
        ApiError.notFound(
          'Cannot update Test Question with id==' +
            id +
            ' Maybe Test Question was not found!'
        )
      );
      return;
    } else {
      res.status(200).send(data);
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.delete = async (id, res, next) => {
  try {
    TestQuestion.findByIdAndRemove(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          next(
            ApiError.notFound(
              'Cannot delete Test Question with id=' +
                id +
                ' Maybe Test Question was not found!'
            )
          );
          return;
        } else {
          res.send({
            message: 'Test Question was deleted successfully!',
            testQuestion: data,
          });
        }
      })
      .catch((err) => {
        next(
          ApiError.internalError(
            err,
            'Could not delete Test Question with id=' + id
          )
        );
        return;
      });
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.findById = async (id, res, next) => {
  try {
    console.log('findById==>', id);
    TestQuestion.findById(id)
      .then((data) => {
        if (data === null) {
          console.log('findById==>before Error return', data);
          next(ApiError.notFound('Not found: Test Question with id=' + id));
          return;
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        next(
          ApiError.internalError(
            err,
            'Error retrieving Test Question with id' + id
          )
        );
        return;
      });
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};

exports.findAll = async (condition) => {
  try {
    const data = await TestQuestion.find(condition);
    if(!data) {
      // next(ApiError.notFound('Not found: Test Questions'));
      return;
    }
    return data;
  } catch (err) {
    // next(ApiError.internalError(err));
    return;
  }
};

exports.findAllPaginate = async (condition, limit, offset, res, next) => {
  try {
    TestQuestion.paginate(condition, { offset, limit })
      .then((data) => {
        console.log('results-data:', data.docs);
        res.send({
          totalItems: data.totalDocs,
          questions: data.docs,
          totalPages: data.totalPages,
          currentPage: data.page - 1,
        });
      })
      .catch((err) => {
        next(
          ApiError.internalError(
            err,
            'Some error occurred while retrieving Test Questions'
          )
        );
        return;
      });
  } catch (err) {
    next(ApiError.internalError(err));
    return;
  }
};
