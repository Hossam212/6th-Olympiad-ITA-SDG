class APIFeatures {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    let queryObj = { ...this.querystring };
    const exclusions = ['sort', 'limit', 'page', 'fields'];
    exclusions.forEach((el) => delete queryObj[el]);
    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(
      /\b('gt'|'lt'|'gte'|'lte')\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(querystr));
    return this;
  }

  limitFields() {
    if (this.querystring.fields) {
      const fields = this.querystring.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  sort() {
    if (this.querystring.sort) {
      const sortBy = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const pagenum = this.querystring.page * 1 || 1;
    const limitnum = this.querystring.limit * 1 || 7;
    const skipnum = (pagenum - 1) * limitnum;
    this.query = this.query.skip(skipnum).limit(limitnum);

    return this;
  }
}
module.exports = APIFeatures;
