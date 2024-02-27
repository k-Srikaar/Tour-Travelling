class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFeilds = ['page', 'limit', 'sort', 'fields'];

    excludeFeilds.forEach((el) => {
      delete queryObj[el];
    });

    // 2 . Advanced Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\bgte\b/g, '$gte');
    queryStr = queryStr.replace(/\bgt\b/g, '$gt');
    queryStr = queryStr.replace(/\blte\b/g, '$lte');
    queryStr = queryStr.replace(/\blt\b/g, '$lt');

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitizing() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIfeatures;
