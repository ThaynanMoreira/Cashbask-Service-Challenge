module.exports = (model) => {
  return async (req, res) => {
    try {
      const query = {}
      const pagOptions = {
        page: (isNaN(req.query.page) ? false : req.query.page - 1) || 0,
        limit: (isNaN(req.query.limit) ? false : Number(req.query.limit)) || 15
      }
      const total = await model.countDocuments(query)
      const meta = {
        meta: {
          currentPage: pagOptions.page,
          limit: pagOptions.limit,
          totalPages: Math.ceil(total / pagOptions.limit),
          count: total
        }
      }

      const data = await model.find(query)
        .sort({ 'created_at': '-1' })
        .skip(pagOptions.page * pagOptions.limit)
        .limit(pagOptions.limit)
        .exec()

      const response = Object.assign({ objects: data }, meta)
      res.status(200).json(response)
    } catch (err) {
      throw err
    }
  }
}
