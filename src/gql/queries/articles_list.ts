const ArticlesListQuery = `
query ArticlesListQuery {
    articles: allArticles {
      slug
    }
  }
`;

export default ArticlesListQuery;