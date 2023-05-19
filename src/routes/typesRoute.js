const express = require('express');
const getTypes = require("../controllers/getTypes")

const router = express.Router();

router.get('/', getTypes);

module.exports = router;