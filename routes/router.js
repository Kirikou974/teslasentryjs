const express = require('express');
const common = require('../common');
const videoRouter = require('./video');
const router = express.Router();

//Always add menu
router.get('*', (req, res, next) => {
	common.getAllEvents().then(events => {
		req.menuItems = events;
		next();
	});
});

router.use('/video', videoRouter);

router.get('/', (req, res) => {
	res.redirect('/home');
});

router.get(['/:pageName'], (req, res) => {
	res.render('pages/index', {
		menuItems: req.menuItems,
		pageName: req.params.pageName,
		clipParams: {
			clipType: req.query.cliptype,
			clipFolder: req.query.clipfolder,
			clipDay: req.query.clipday
		}
	});
});

module.exports = router;
