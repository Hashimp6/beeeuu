const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: String,
  image: String,
  apiEndpoint: String,
});

const categoryGroupSchema = new mongoose.Schema({
  title: String,
  icon: String,
  categories: [subCategorySchema],
});

module.exports = mongoose.model('Category', categoryGroupSchema);
