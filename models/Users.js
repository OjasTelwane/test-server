const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Users = new Schema(
  {
    name: {
      type: String,
      default: '',
      required: true,
      trim: true,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

Users.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Users', Users);
