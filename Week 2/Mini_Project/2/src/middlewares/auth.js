const auth = (req, res, next) => {
// 
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).send('Access Denied: No Token Provided!');
  }

  try {
    const bearerToken = token.split(' ')[1];
    if (bearerToken === process.env.API_TOKEN) {
      next();
    } else {
      res.status(400).send('Invalid Token.');
    }
  } catch (error) {
    res.status(400).send('Invalid Token Format.');
  }
};

module.exports = auth;
