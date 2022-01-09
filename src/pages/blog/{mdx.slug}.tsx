import { VFC} from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { MDXRenderer } from "gatsby-plugin-mdx";
import Layout from "../../components/layout";


const BlogPost = ({ data }) => {
  if (data === undefined) {
    throw new Error(`data should be passed`)
  }
  const image = getImage(data.mdx.frontmatter.hero_image);
  if (image === undefined) {
    throw new Error(`image should be got`)
  }
  return (
    <Layout pageTitle={data.mdx.frontmatter.title}>
      <p>Posted:　{data.mdx.frontmatter.date}</p>
        <GatsbyImage image={image} alt={data.mdx.frontmatter.hero_image_alt} />
      <p>
        Photo Credit:{" "}
        <a href={data.mdx.frontmatter.hero_image_credit_link}>
          {data.mdx.frontmatter.hero_image_credit_text}
        </a>
      </p>
      <MDXRenderer>{data.mdx.body}</MDXRenderer>
    </Layout>
  );
};

export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        hero_image_alt
        hero_image_credit_link
        hero_image_credit_text
        hero_image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`;

export default BlogPost;
