const requiredRole = (...roles) => {
  return (req, res, next) => {

    console.log("checking....");
    console.log("iser from jwt:", req.user);
    console.log("roles allowed:", roles);

    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden'
      });
    }

    next();
  };
};

module.exports = requiredRole;