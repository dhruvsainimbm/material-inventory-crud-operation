const express = require("express");
const router = express.Router();
const pool = require("../db");
const units = require("../units.json");
const taxRates = require("../taxRates.json");

// Helpers
const isValidUnitId = (id) => units.some((u) => u.id === id);
const isValidTaxRateId = (id) => taxRates.some((t) => t.id === id);

// CREATE
router.post("/", async (req, res) => {
  const { batchNumber, materialName, alertQuantity, unitId, taxRateId } =
    req.body;

  if (
    !batchNumber ||
    !materialName ||
    !alertQuantity ||
    !unitId ||
    !taxRateId
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!isValidUnitId(unitId))
    return res.status(400).json({ error: "Invalid unitId" });
  if (!isValidTaxRateId(taxRateId))
    return res.status(400).json({ error: "Invalid taxRateId" });

  try {
    const existing = await pool.query(
      "SELECT * FROM materials WHERE batch_number = $1 AND material_name = $2",
      [batchNumber, materialName]
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Duplicate batchNumber + materialName" });
    }

    await pool.query(
      `INSERT INTO materials (batch_number, material_name, alert_quantity, unit_id, tax_rate_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [batchNumber, materialName, alertQuantity, unitId, taxRateId]
    );

    res.status(201).json({ message: "Material added" });
  } catch (err) {
    console.error("POST /materials error:", err);
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM materials");
  res.json(result.rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { batchNumber, materialName, alertQuantity, unitId, taxRateId } =
    req.body;

  if (!isValidUnitId(unitId))
    return res.status(400).json({ error: "Invalid unitId" });
  if (!isValidTaxRateId(taxRateId))
    return res.status(400).json({ error: "Invalid taxRateId" });

  try {
    const conflict = await pool.query(
      `SELECT * FROM materials
       WHERE batch_number = $1 AND material_name = $2 AND id != $3`,
      [batchNumber, materialName, id]
    );

    if (conflict.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Duplicate batchNumber + materialName" });
    }

    await pool.query(
      `UPDATE materials
       SET batch_number=$1, material_name=$2, alert_quantity=$3, unit_id=$4, tax_rate_id=$5
       WHERE id=$6`,
      [batchNumber, materialName, alertQuantity, unitId, taxRateId, id]
    );

    res.json({ message: "Material updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM materials WHERE id = $1", [req.params.id]);
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
