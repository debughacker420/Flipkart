const { query } = require('../db/connection');

// ─────────────────────────────────────────────────────────────
// GET /api/addresses
// ─────────────────────────────────────────────────────────────
const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rows } = await query(
      `SELECT
         id,
         name,
         mobile,
         pincode,
         address1,
         address2,
         city,
         state,
         country,
         type,
         is_default,
         created_at
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, id ASC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/addresses
// ─────────────────────────────────────────────────────────────
const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phone,
      pincode,
      addressLine1,
      addressLine2 = '',
      city,
      state,
      country = 'India',
      type = 'HOME',
      isDefault = false,
    } = req.body;

    // ── Validation ─────────────────────────────────────────
    const errors = [];

    if (!fullName || !fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }

    if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) {
      errors.push({ field: 'phone', message: 'Valid 10-digit Indian mobile number is required' });
    }

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      errors.push({ field: 'pincode', message: 'Valid 6-digit pincode is required' });
    }

    if (!addressLine1 || !addressLine1.trim()) {
      errors.push({ field: 'addressLine1', message: 'Address line 1 is required' });
    }

    if (!city || !city.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    }

    if (!state || !state.trim()) {
      errors.push({ field: 'state', message: 'State is required' });
    }

    if (errors.length) {
      return res.status(400).json({ status: 'error', errors });
    }

    // ── If isDefault, unset all existing defaults first ───
    if (isDefault) {
      await query(
        `UPDATE addresses
         SET is_default = false, updated_at = NOW()
         WHERE user_id = $1 AND is_default = true`,
        [userId]
      );
    }

    // ── Insert ─────────────────────────────────────────────
    const { rows } = await query(
      `INSERT INTO addresses
         (user_id, name, mobile, pincode, address1, address2,
          city, state, country, type, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        userId,
        fullName.trim(),
        phone,
        pincode,
        addressLine1.trim(),
        addressLine2.trim(),
        city.trim(),
        state.trim(),
        country,
        type,
        isDefault,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  addAddress,
};
