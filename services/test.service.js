/*******************************************************************************************************
 * Tests Service currently Loading and Saving Data from Mongo Db file
 * @company : Imatmi.
 * @author : Ojas Telwane.
 * @Copyright : 2021 Imatmi.
 * =====================================================================================================
 * Modification History
 * Date				Modified By		Changes Description
 * 27/09/2021 Ojas Telwane	Created
 *******************************************************************************************************/

const Test = require('../models/Test');
const ApiError = require('../middleware/api.error');

exports.create = async (testDto) => {
  try {
    const newTest = new Test(testDto);
    const data = await newTest.save();
    if (!data) {
      return null;
    } else {
      return data;
    }
  } catch (err) {
    return null;
  }
};

exports.update = async (id, testDto) => {
  try {
    const data = await Test.findByIdAndUpdate(id, testDto, {
      useFindAndModify: false,
    });

    if (!data) {
      return null;
    } else {
      return data;
    }
  } catch (err) {
    return null;
  }
};

exports.delete = async (id) => {
  try {
    const data = await Test.findByIdAndRemove(id, { useFindAndModify: false });
    if (!data) {
      return null;
    } else {
      return data;
    }
  } catch (err) {
    return null;
  }
};

exports.findById = async (id) => {
  try {
    console.log('findById==>', id);
    const data = await Test.findById(id);
    if (data === null) {
      return null;
    } else {
      return data;
    }
  } catch (err) {
    next(ApiError.internalError(err));
    return null;
  }
};

exports.findAll = async (condition) => {
  try {
    const data = await Test.find(condition);
    if (data === null) {
      return null;
    } else {
      return data;
    }
  } catch (err) {
    return null;
  }
};

exports.findAllPaginate = async (condition, limit, offset) => {
  try {
    const data = await Test.paginate(condition, { offset, limit });
    if (data === null) {
      return null;
    } else {
      console.log('results:', data);
      console.log('results-data:', data.docs);
      return {
        totalItems: data.totalDocs,
        tests: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      };
    }
  } catch (err) {
    return null;
  }
};
