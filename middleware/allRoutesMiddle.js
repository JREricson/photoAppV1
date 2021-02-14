// allRoutesMidware.renderPageWithUserAndContentOwner = (
//    req,
//    res,
//    pagePath,
//    objOfValToBeSent,
// ) => {
//    User.findById(req.params.id, (err, contentOwner) => {
//       if (err) {
//          console.log(err);
//          res.status(500).render('server error');
//       } else {
//          currentUser = req.user;
//          let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
//          res.render(pagePath, vals);
//       }
//    });
// };
