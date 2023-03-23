import express from "express";

const router= express.Router({caseSensitive:true});

router.get('auth',function (req,res) {
console.log('auth0');
res.send('asf')
})

export default router;