/**
 * Created by xiaos on 16/11/10.
 */
var express = require('express');
var router = express.Router();
const postsModel = require('../models/posts')
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页
router.get('/', function(req, res, next) {
    var author = req.query.author;

    postsModel.getPosts(author)
        .then(posts=> {
            const user = req.session.user
            const newPosts = posts.map(post=>{
                post.isSelf = user && post.author._id && user._id.toString() === post.author._id.toString()
                return post
            })
            res.render('posts', {
                posts:newPosts
            })
        })
        .catch(next);
})

// POST /posts 发表一篇文章
router.post('/', checkLogin, function(req, res, next) {
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    // 校验参数
    try {
        if (!title.length) {
            throw new Error('请填写标题');
        }
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    const post = {
        author:author,
        title:title,
        content:content,
        pv:0
    }

    postsModel.create(post).then(result=>{
        // 此 post 是插入 mongodb 后的值，包含 _id
        const post = result.ops[0];
        // 发表成功后跳转到该文章页
        req.flash('success', '发表成功');
        return res.redirect(`/posts/${post._id}`)
    }).catch(next)

});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
    res.render("create")
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function(req, res, next) {
    var postId = req.params.postId;

    Promise.all([
            postsModel.getPostById(postId),// 获取文章信息
            postsModel.incPv(postId)// pv 加 1
        ])
        .then(function (result) {
            var post = result[0];
            if (!post) {
                throw new Error('该文章不存在');
            }
            res.render('posts', {
                posts: [post]
            });
        })
        .catch(next);
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    postsModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('该文章不存在');
            }
            if (author.toString() !== post.author._id.toString()) {
                throw new Error('权限不足');
            }
            res.render('edit', {
                post: post
            });
        })
        .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    postsModel.updatePostById(postId, author, { title: title, content: content })
        .then(function () {
            req.flash('success', '编辑文章成功');
            // 编辑成功后跳转到上一页
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    postsModel.delPostById(postId, author)
        .then(function () {
            req.flash('success', '删除文章成功');
            // 删除成功后跳转到主页
            res.redirect('/posts');
        })
        .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
    res.send(req.flash());
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
    res.send(req.flash());
});

module.exports = router;