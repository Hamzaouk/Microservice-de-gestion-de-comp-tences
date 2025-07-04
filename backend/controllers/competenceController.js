const Competence = require("../models/competenceModel");

// Helper to calculate global status
const calculateStatus = (subCompetences) => {
  if (!Array.isArray(subCompetences) || subCompetences.length === 0) {
    return "not validated";
  }
  const validated = subCompetences.filter(sc => sc.validated).length;
  const total = subCompetences.length;
  return validated >= (total / 2) ? "validated" : "not validated";
};

// GET all competences with global status
const getAll = async (req, res) => {
  try {
    const competences = await Competence.find();
    const result = competences.map(c => ({
      ...c.toObject(),
      globalStatus: calculateStatus(c.subCompetences)
    }));
    res.json(result);
  } catch (err) {
    console.error("Error in getAll:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST create a competence (with enhanced debugging)
const create = async (req, res) => {
  try {
    const { code, name, subCompetences } = req.body;
    
    // Basic validation
    if (!code || !name || !Array.isArray(subCompetences) || subCompetences.length === 0) {
      return res.status(400).json({ error: "Code, name, and subCompetences are required" });
    }
    
    const newCompetence = new Competence({ code, name, subCompetences });
    const saved = await newCompetence.save();
    
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Competence code already exists" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// PUT update sub-competences
const update = async (req, res) => {
  try {
    const competence = await Competence.findById(req.params.id);
    if (!competence) return res.status(404).json({ message: "Compétence non trouvée" });

    const { name, code, subCompetences } = req.body;

    if (name !== undefined) competence.name = name;
    if (code !== undefined) competence.code = code;
    if (subCompetences !== undefined) {
      competence.subCompetences = subCompetences;
      competence.status = calculateStatus(subCompetences);
    }

    const updated = await competence.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Erreur update :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// DELETE a competence
const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Competence.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Competence not found" });
    }
    res.json({ message: "Competence deleted successfully" });
  } catch (err) {
    console.error("Error in remove:", err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};