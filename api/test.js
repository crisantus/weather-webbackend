module.exports = (_req, res) => {
  res.status(200).json({
    status: true,
    message: "Vercel backend function is live"
  });
};
