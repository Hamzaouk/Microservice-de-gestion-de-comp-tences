const mongoose = require("mongoose");

const subCompetenceSchema = new mongoose.Schema({
  name: String,
  validated: Boolean
}, { _id: false })

const competenceSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subCompetences: {
    type: [subCompetenceSchema],
    validate: v => Array.isArray(v) && v.length > 0
  }
})

module.exports = mongoose.model('Competence', competenceSchema);
