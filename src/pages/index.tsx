import * as React from 'react';
import { graphql, PageProps } from "gatsby";
import { Card} from "../components/card"
import Layout from "../components/layout";
import * as styles from "./index.module.css";


const BlogPage: React.FC<PageProps<GatsbyTypes.BlogPostsQuery>> = (props) => {
  const nodes = props.data.allMdx.nodes;
  if (nodes === undefined) {
    throw new Error(`nodes should be`)
  }
  const frontmatters = nodes.map((node) => node.frontmatter)
  if (frontmatters.some((e) => e === undefined)) { throw new Error(`should be`) }
  frontmatters;

  type data = GatsbyTypes.BlogPostsQuery['allMdx']['nodes'][0]['frontmatter']

  return (
    <Layout pageTitle="Blog posts">
      <div className={ styles.cards}>
        <div className={styles.card}>
          {frontmatters.map((e:data) => {
            return <Card data={e} key={e?.path}/>
          })}
        </div>
      </div>
    </Layout>
  )
};
export const query = graphql`
  query BlogPosts{
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        frontmatter {
          date(formatString: "MMMM D, YYYY")
          title
          path
          hero_image_alt
          hero_image {
            childImageSharp {
              gatsbyImageData
            }
          }
        }
      }
    }
  }
`


export default BlogPage;
