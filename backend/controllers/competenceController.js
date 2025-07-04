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
    console.log("=== CREATE COMPETENCE DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);
    console.log("Body type:", typeof req.body);
    console.log("Body is null/undefined:", req.body == null);
    
    // Enhanced body validation
    if (req.body == null) {
      console.log("ERROR: Request body is null or undefined");
      return res.status(400).json({ 
        error: "Request body is null or undefined. Make sure Content-Type is application/json" 
      });
    }
    
    console.log("Body keys:", Object.keys(req.body));
    
    // Check if body is empty
    if (Object.keys(req.body).length === 0) {
      console.log("ERROR: Request body is empty");
      return res.status(400).json({ 
        error: "Request body is empty. Please provide competence data." 
      });
    }
    
    // Destructure with defaults to avoid undefined errors
    const { code, name, subCompetences = [] } = req.body;
    
    // Check required fields
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!Array.isArray(subCompetences) || subCompetences.length === 0) {
      return res.status(400).json({ error: "SubCompetences array is required and must not be empty" });
    }
    
    console.log("Validation passed, creating competence...");
    
    const competenceData = {
      code,
      name,
      subCompetences
    };
    
    console.log("Competence data to save:", competenceData);
    
    const newCompetence = new Competence(competenceData);
    const saved = await newCompetence.save();
    
    console.log("Competence saved successfully:", saved);
    res.status(201).json(saved);
    
  } catch (err) {
    console.error("Error in create:", err);
    console.error("Error stack:", err.stack);
    
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