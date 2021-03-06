const express = require('express');
const User = require('../models/user.js');

const router = express.Router();

const Form = require('../models/form.js');
const Qa = require('../models/qa.js');

/* GET log in page */
router.get('/', (req, res) => {
  res.render('indexlogin', { layout: 'layout-login-signup.hbs' });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}


/* GET form page */
router.get('/home', ensureAuthenticated, (req, res) => {
  Form.find({ user: req.user._id})
    .then((result) => {
      const status = result[result.length - 1].codingStatus;
      const study = result[result.length - 1].getBetter;
      res.render('home', {
        obj: result, phrase: status, tool: study, user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/chart', ensureAuthenticated, (req, res) => {
  Form.find({ user: req.user._id })
    .then((response) => {
      res.send(200, response);
    })
    .catch(error => console.log(error));
});

/* GET form page */
router.get('/form', ensureAuthenticated, (req, res) => {
  res.render('form', { layout: 'layout-login-signup.hbs' });
});

/* GET account page */
router.get('/account', ensureAuthenticated, (req, res) => {
  User.findById(req.user._id)
    .then((result) => {
      res.render('account', { obj: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

/* GET chart page */
router.get('/chart', ensureAuthenticated, (req, res) => {
  res.render('chart', { user: req.user });
});

/* GET timeline page */
router.get('/timeline', (req, res) => {
  Form.find({ user: req.user._id }).lean()
    .then((result) => {
      const resultMapped = result.map((o) => {
        const objDate = new Date(o.createdAt);
        o.dateParsed = `${objDate.getDate()}/${objDate.getMonth() + 1 }`;
        return o;
      });
      res.render('timeline', { form: resultMapped });
    })
    .catch((err) => {
      console.log(err);
    });
});


/* GET flashcard page */
router.get('/flashcard', ensureAuthenticated, (req, res) => {
  Qa.find({ user: req.user._id })
    .then((result) => {
      const ramdonObject = result[Math.round(Math.random() * (result.length))];
      res.render('flashcard', { obj: result, rdnobj: ramdonObject });
    })
    .catch((err) => {
      console.log(err);
    });
});

/* GET journal page */
router.get('/journal', ensureAuthenticated, (req, res) => {
  Form.find({ user: req.user._id }).lean()
    .then((result) => {
      const resultMapped = result.map((o) => {
        const objDate = new Date(o.createdAt);
        o.dateParsed = `${objDate.getDate()}/${objDate.getMonth() + 1 }`;
        return o;
      });
      res.render('journal', { form: resultMapped });
    })
    .catch((err) => {
      console.log(err);
    });
});

/* POST form page */
router.post('/form', ensureAuthenticated, (req, res) => {
  const user = req.user._id;
  const {
    codingStatus, getBetter, questionText, answerText, journal, htmlRange, cssRange, jsRange, mongoRange, reactRange, timestamps } = req.body;
  const questAns = { questionText, answerText };
  const usedTools = {
    htmlRange, cssRange, jsRange, mongoRange, reactRange,
  };
  const newForm = new Form({
    codingStatus, getBetter, questAns, journal, usedTools, user, timestamps, 
  });
  newForm.save()
    .then(() => {
      res.redirect('home');
    })
    .catch((error) => {
      console.log(error);
    });
});

/* POST FlashCard page */
router.post('/flashcard', ensureAuthenticated, (req, res) => {
  console.log(req.user);
  const user = req.user._id;
  const { questionText, answerText, timestamps } = req.body;
  const questAns = { questionText, answerText };
  const newForm = new Qa({ questAns, user, timestamps });
  newForm.save()
    .then(() => {
      res.redirect('/flashcard');
    })
    .catch((error) => {
      console.log(error);
    });
});

/* UPDATE User  */
router.post('/update', ensureAuthenticated, (req, res) => {
  const { firstName, lastName, email } = req.body;
  User.findOneAndUpdate({ _id: req.user._id }, { $set: { firstName, lastName, email } })
    .then(() => {
      res.redirect('/account');
    })
    .catch((error) => {
      console.log(error);
    });
});

/* DELETE USER */
router.get('/delete', ensureAuthenticated, (req, res) => {
  User.findOneAndRemove({ _id: req.user._id })
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
