const path = require("path")
const { randomNumber } = require("../helpers/libs")
const fs = require("fs-extra")
const { Image, Comment } = require("../models")
const md5 = require("md5")

const ctrl = {}

ctrl.index = async (req, res) => {
    const viewModel = { image: {}, comment: {} }
    const image2 = await Image.findOne({ _id: req.params.image_id })
    if (image2) {
        image2.views = image2.views + 1
        await image2.save();
        const image = await Image.findOne({ _id: req.params.image_id }).lean();
        viewModel.image = image;
        const comment = await Comment.find({ image_id: image._id }).lean()
        viewModel.comment = comment;
        res.render("image", viewModel)
    } else {
        res.redirect("/")
    }
}

ctrl.create = (req, res) => {

    const saveImage = async () => {
        const imgUrl = randomNumber()
        const images = await Image.find({ filename: imgUrl })
        if (images.length > 0) {
            saveImage()
        } else {
            const ext = path.extname(req.file.originalname).toLowerCase()
            const imageTempPath = req.file.path
            const targetPath = `src/public/upload/${imgUrl}${ext}`

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imageTempPath, targetPath)
                const newImg = new Image({
                    title: req.body.title,
                    description: req.body.description,
                    filename: imgUrl + ext,
                })
                console.log(newImg)
                const imageSaved = await newImg.save();
                res.redirect("/images/" + newImg._id)
            } else {
                await fs.unlink(imageTempPath)
                res.status(500).json({ error: "Only Images are allowed" })
            }
        }
    }

    saveImage()
}
ctrl.like = async(req, res) => {
    const image2 = await Image.findOne({ _id: req.params.image_id })
    if (image2) {
        image2.likes = image2.likes + 1
        await image2.save();
        const image = await Image.findOne({ _id: req.params.image_id }).lean();
        res.json({likes: image.likes})
    } else {
        res.status(404).json({error: "Internal error"})
    }

}
ctrl.comment = async (req, res) => {
    const image = await Image.findOne({ _id: req.params.image_id }).lean()
    if (image) {
        const newComment = new Comment(req.body)
        newComment.gravatar = md5(newComment.email)
        newComment.image_id = image._id
        await newComment.save()
        console.log(newComment)
        res.redirect("/images/" + image._id)
    } else {
        res.redirect("/")
    }
}
ctrl.remove = async(req, res) => {
    const image = await Image.findOne({ _id: req.params.image_id })
    if(image){
        await Comment.deleteOne({_id: image._id})
        await image.remove()
        res.json(true)
    }
}

module.exports = ctrl