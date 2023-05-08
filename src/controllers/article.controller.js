const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { articleService } = require('../services');
const Article = require('../models/article.model');
const jwt = require('jsonwebtoken');

const addArticle = catchAsync(async (req, res) => {
  if (req.files && Object.keys(req.files).length > 0) {
    let image = req.files.image;
    const ext = image.name.split('.').filter(Boolean).slice(1);
    const fileName = Date.now() + '.' + ext[0];
    image.mv('public/article_thumbs/' + fileName, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      req.body.image = fileName;
      const slug = generateSlug(req.body.title);
      req.body.slug = slug;

      try {
        const article = await articleService.createArticle(req.body);
        res.status(httpStatus.CREATED).send({ data: article, success: true, message: 'Article added successfully!' });
      } catch (err) {
        res.send({ data: null, success: false, message: 'Title already taken!' });
      }
    });
  }
});

const searchArticles = catchAsync(async (req, res) => {
  const query = req.body.query;
  const regex = new RegExp(query, 'i');
  Article.find({
    $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }, { body: { $regex: regex } }],
  })
    .populate('userId', 'name avatar')
    .exec((err, articles) => {
      if (err) {
        console.log(err);
      } else {
        res.send(articles);
      }
    });
});

function generateSlug(title) {
  // Implement your slug generation logic here
  // This could involve removing special characters, replacing spaces with dashes, etc.
  return title.toLowerCase().replace(/\s+/g, '-');
}
async function generateSlugs() {
  try {
    const articles = await Article.find();

    for (const document of articles) {
      const slug = generateSlug(document.title);

      const record = await Article.findById(document.id);
      if (!record) {
        console.log(`Record with ID ${document.id} not found.`);
        continue;
      }

      record.slug = slug;
      await record.save();
      console.log(`Record with ID ${document.id} updated successfully.`);
    }
  } catch (err) {
    console.error(err);
  }
}

const getArticles = catchAsync(async (req, res) => {
  if (req.params.articleId == undefined) {
    if (req.headers.userid) {
      const articles = await Article.find({ userId: req.headers.userid }).populate('userId', 'name avatar');
      res.send(articles);
    } else {
      const articles = await Article.find().populate('userId', 'name avatar').sort({ updatedAt: -1 });
      let data = {
        all: articles,
        newest: articles[0],
        recent: articles.slice(1, 4),
        featured: articles
          .sort(function () {
            return 0.5 - Math.random();
          })
          .slice(0, 5),
      };

      res.send(data);
    }
  } else {
    console.log(req.params.articleId);
    const article = await Article.find({ slug: req.params.articleId }).populate('userId', 'name avatar');
    res.send(article);
  }
});

const getCategoryArticles = catchAsync(async (req, res) => {
  const articles = await Article.find({ category: req.params.categoryId }).populate('userId', 'name avatar');
  res.send(articles);
});

const getAuthorArticles = catchAsync(async (req, res) => {
  const articles = await Article.find({ userId: req.params.authorId }).populate('userId', 'name avatar');
  res.send(articles);
});

const deleteArticles = catchAsync(async (req, res) => {
  const article = await Article.findById(req.params.articleId);
  await article.remove();
  res.send({ data: null, success: true, message: 'Article deleted successfully!' });
});
const getUserIdFromJWT = async (token) => {
  try {
    token = token.split(' ')[1];
    const secret = 'thisisasamplesecret';
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
    const userId = decoded.sub;
    return userId;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateArticle = catchAsync(async (req, res) => {
  const article = await Article.findById(req.body.id);
  if (req.files && Object.keys(req.files).length > 0) {
    let image = req.files.image;
    const ext = image.name.split('.').filter(Boolean).slice(1);
    const fileName = Date.now() + '.' + ext[0];
    image.mv('public/article_thumbs/' + fileName, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      req.body.image = fileName;
      Object.assign(article, req.body);
      await article.save();
      res.status(httpStatus.CREATED).send({ data: article, success: true, message: 'Article updated successfully!' });
    });
  } else {
    req.body.image = article.image;
    Object.assign(article, req.body);
    await article.save();
    res.status(httpStatus.CREATED).send({ data: article, success: true, message: 'Article updated successfully!' });
  }
});

module.exports = {
  addArticle,
  getArticles,
  updateArticle,
  deleteArticles,
  getCategoryArticles,
  getAuthorArticles,
  searchArticles,
};
