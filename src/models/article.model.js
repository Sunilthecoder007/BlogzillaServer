const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const articleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'technology',
      'business',
      'marketing',
      'health',
      'travel',
      'food',
      'fashion',
      'entertainment',
      'sports',
      'politics',
    ],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// add plugin that converts mongoose to json
articleSchema.plugin(toJSON);
articleSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} slug - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
articleSchema.statics.isSlugTaken = async function (slug, excludeUserId) {
  const article = await this.findOne({ slug, _id: { $ne: excludeUserId } });
  return !!article;
};

articleSchema.pre('save', async function (next) {
  const article = this;
  next();
});

/**
 * @typedef Article
 */
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
