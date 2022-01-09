import * as React from 'react';
import { Link, graphql, PageProps } from "gatsby";
import Layout from "../components/layout";
import * as styles from "./index.module.css";


const BlogPage: React.FC<PageProps<GatsbyTypes.BlogPostsQuery>> = (props) => {
  const nodes = props.data.allMdx.nodes;
  if (nodes === undefined) {
    throw new Error(`nodes should be`)
  }

  return (
    <Layout pageTitle="My Blog Posts">
      {nodes.map((node) => {
        const { title, date } = node.frontmatter || {};
        if (title === null || title === undefined || date === null || date === undefined) {
          throw new Error(`title and date should be defined`)
        }
        return(
        <article key={node.id}>
            <h2 >
            <Link className={ styles.siteTitle} to={`/${node.slug}`}>{title}</Link>
          </h2>
          <p>Posted: {date}</p>
        </article>)
      })}
    </Layout>
  );
};
export const query = graphql`
  query BlogPosts{
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        frontmatter {
          date(formatString: "MMMM D, YYYY")
          title
        }
        slug
        id
      }
    }
  }
`;
export default BlogPage;
