import * as React from 'react';
import { Link, graphql, PageProps } from "gatsby";
import { Card} from "../components/card"
import Layout from "../components/layout";
import * as styles from "./index.module.css";


const BlogPage: React.FC<PageProps<GatsbyTypes.BlogPostsQuery>> = (props) => {
  const nodes = props.data.allMdx.nodes;
  if (nodes === undefined) {
    throw new Error(`nodes should be`)
  }
  const frontmatters = nodes.map((node: any) => node.frontmatter)
  if (frontmatters.some((e: any) => e === undefined)) { throw new Error(`should be`) }
  frontmatters;

  type data = GatsbyTypes.BlogPostsQuery['allMdx']['nodes'][0]['frontmatter']

  return (
    <Layout pageTitle="Blog posts">
      <div>
        {frontmatters.map((e:data) => {
          return <Card data={e} key={e?.path}/>
        })}
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
