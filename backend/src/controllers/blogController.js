const { Op } = require('sequelize');
const slugify = require('slugify');
const { BlogPost, BlogCategory, User } = require('../models');
const { logActivity } = require('../middleware/activityLogMiddleware');

const PUBLIC_INCLUDES = [
  { model: BlogCategory, as: 'category' },
  { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
];

async function listPublic(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const { search, category, tag } = req.query;
    const where = { status: 'published' };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) {
      where['$category.slug$'] = category;
    }
    if (tag) {
      where.tags = { [Op.like]: `%"${tag}"%` };
    }
    const { rows, count } = await BlogPost.findAndCountAll({
      where,
      include: PUBLIC_INCLUDES,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const post = await BlogPost.findOne({
      where: { slug: req.params.slug, status: 'published' },
      include: PUBLIC_INCLUDES,
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
}

async function listCategories(req, res, next) {
  try {
    const categories = await BlogCategory.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
}

// ---- Admin ----
async function adminList(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await BlogPost.findAndCountAll({
      where,
      include: PUBLIC_INCLUDES,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const data = { ...req.body };
    data.authorId = req.user.id;
    data.slug = data.slug || slugify(data.title, { lower: true, strict: true });
    if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();
    if (req.file) data.featuredImage = `blog/${req.file.filename}`;
    const post = await BlogPost.create(data);
    await logActivity(req, 'blog.create', `Created post: ${post.title}`);
    res.status(201).json({ success: true, data: { post } });
  } catch (err) { next(err); }
}

async function adminUpdate(req, res, next) {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    const allowed = ['categoryId', 'title', 'slug', 'excerpt', 'content', 'featuredImage',
      'tags', 'metaTitle', 'metaDescription', 'status', 'publishedAt'];
    for (const k of allowed) if (req.body[k] !== undefined) post[k] = req.body[k];
    if (req.file) post.featuredImage = `blog/${req.file.filename}`;
    if (post.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
    await post.save();
    await logActivity(req, 'blog.update', `Updated post ${post.id}`);
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await post.destroy();
    await logActivity(req, 'blog.delete', `Deleted post ${post.id}`);
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) { next(err); }
}

async function adminCreateCategory(req, res, next) {
  try {
    const { name, slug, description } = req.body;
    const category = await BlogCategory.create({
      name, slug: slug || slugify(name, { lower: true, strict: true }), description,
    });
    await logActivity(req, 'blog.category_create', `Created category: ${category.name}`);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) { next(err); }
}

module.exports = {
  listPublic, getBySlug, listCategories,
  adminList, adminCreate, adminUpdate, adminDelete, adminCreateCategory,
};
