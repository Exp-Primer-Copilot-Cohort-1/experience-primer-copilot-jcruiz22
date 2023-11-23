//Create web server
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const { Comment, validate } = require('../models/comment');
const { Post } = require('../models/post');

//Get all comments
router.get('/', async (req, res) => {
    const comments = await Comment.find().sort('name');
    res.send(comments);
});

//Get comment by id
router.get('/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).send('The comment with the given ID was not found.');
    res.send(comment);
});

//Create comment
router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.send(error.details[0].message);

    const post = await Post.findById(req.body.postId);
    if (!post) return res.status(400).send('Invalid post.');

    let comment = new Comment({
        text: req.body.text,
        post: {
            _id: post._id,
            title: post.title
        },
        user: {
            _id: req.user._id,
            name: req.user.name
        }
    });

    comment = await comment.save();

    res.send(comment);
});

//Update comment
router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.send(error.details[0].message);

    const comment = await Comment.findByIdAndUpdate(req.params.id, { text: req.body.text }, {
        new: true
    });
    if (!comment) return res.status(404).send('The comment with the given ID was not found.');

    res.send(comment);
});

//Delete comment
router.delete('/:id', auth, async (req, res) => {
    const comment = await Comment.findByIdAndRemove(req.params.id);
    if (!comment) return res.status(404).send('The comment with the given ID was not found.');

    res.send(comment);
});

module.exports = router;
