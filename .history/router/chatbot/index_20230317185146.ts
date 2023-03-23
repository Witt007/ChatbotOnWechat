import express from "express";

const router= express.Router({caseSensitive:true});

router.get('/auth',function (req,res) {
res.send('asf')
})

export default router;