const {
  Schema,
  model,
} = require('mongoose');

const {
  ObjectId,
} = Schema.Types;

const userSchema = new Schema({
  name: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  any: {
    type: ObjectId,
    ref: 'Any',
  },
});

module.exports = model('User', userSchema);
