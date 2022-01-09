import { VFC} from "react";
import { graphql, PageProps } from "gatsby";
import { GatsbyImage} from "gatsby-plugin-image";
import { MDXRenderer } from "gatsby-plugin-mdx";
import Layout from "../../components/layout";


const BlogPost: VFC<PageProps<any>> = (props) => {
  const { mdx } = props.data;
  const { body, frontmatter } = mdx || {}
  const { title, date,hero_image, hero_image_alt,hero_image_credit_link, hero_image_credit_text} = frontmatter

  // const image = getImage(data.mdx.frontmatter.hero_image);
  // if (image === undefined) {
  //   throw new Error(`image should be got`)
  // }
  return (
    <Layout pageTitle={title}>
      <p>Posted:　{date}</p>
        <GatsbyImage image={hero_image} alt={hero_image_alt} />
      <p>
        Photo Credit:{" "}
        <a href={hero_image_credit_link}>
          {hero_image_credit_text}
        </a>
      </p>
      <MDXRenderer>{body}</MDXRenderer>
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
