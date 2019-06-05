const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth')

// Load idea model
require('../models/Idea')
const Idea = mongoose.model('ideas')

// Idea Index
router.get('/', (req, res) => {
  Idea.find({user: req.user.id})
    .sort({date:'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      })
    })
})

// Add Ideas Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit Ideas Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {
        idea: idea
      });
    }
  })
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  //console.log(req.body)
  let errors = [];

  if(!req.body.title){
    errors.push({text: 'Please add a tilte'})
  }

  if(!req.body.details){
    errors.push({text: 'Please add some details'})
  }

  if(errors.length > 0){
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }

    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added')
        res.redirect('/ideas')
      })
  }
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {

    // New Value
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Video idea edited')
        res.redirect('/ideas')
      })
  })
})

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video idea removed successfully')
      res.redirect('/ideas')
    })
})

module.exports = router;