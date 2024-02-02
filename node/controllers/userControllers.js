exports.getAllUsers = (req, res) => {
  res.status(200).json({
    message: 'Success',
    results: `This is content of all users`,
  });
};

exports.getUser = (req, res) => {
  const idd = req.params.id * 1;
  res.status(200).json({
    message: 'Success',
    results: `This is the the user ${idd}`,
  });
};
