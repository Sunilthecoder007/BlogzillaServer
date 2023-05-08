const Joi = require('joi');
const { password } = require('./custom.validation');

const addArticle = {
  body: Joi.object().keys({
    image: Joi.any(),
    title: Joi.string().min(5).max(100).required(),
    userId: Joi.string().required(),
    description: Joi.string().min(10).max(1000).required(),
    body: Joi.string().min(50).max(5000000).required(),
    category: Joi.string()
      .valid(
        'technology',
        'business',
        'marketing',
        'health',
        'travel',
        'food',
        'fashion',
        'entertainment',
        'sports',
        'politics'
      )
      .required(),
  }),
};
const getArticles = {
  userId: Joi.string(),
};
const searchArticles = {
  query: Joi.any().required(),
};
const updateArticle = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    image: Joi.any(),
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    body: Joi.string().min(50).max(5000000).required(),
    category: Joi.string()
      .valid(
        'technology',
        'business',
        'marketing',
        'health',
        'travel',
        'food',
        'fashion',
        'entertainment',
        'sports',
        'politics'
      )
      .required(),
  }),
};

module.exports = {
  addArticle,
  getArticles,
  updateArticle,
  searchArticles,
};
