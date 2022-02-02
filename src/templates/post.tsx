import * as React from 'react';
import { graphql, PageProps } from "gatsby";
import { GatsbyImage,getImage, ImageDataLike} from "gatsby-plugin-image";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider }  from "@mdx-js/react"

import Layout from "../components/layout";

import * as styles from "./post.module.css"

const BlogPost: React.FC<PageProps<GatsbyTypes.BlogPostQuery>> = (props) => {

  const { mdx } = props.data;
  const { body, frontmatter } = mdx || {}
  if (frontmatter === undefined||body === undefined) {
    throw new Error(`frontmatter should be`)
  }
  const { title, date, hero_image_alt, hero_image_credit_link, hero_image_credit_text,hero_image } = frontmatter
  if (title === undefined || date === undefined || hero_image_alt === undefined || hero_image_credit_link === undefined || hero_image_credit_text === undefined || hero_image=== undefined) {
    throw new Error(`should be`)
  }

  // 型はasを使わないでどうにかできないものか。。。
  const image = getImage({...hero_image.childImageSharp} as ImageDataLike)

  if (image === undefined) {
    throw new Error(`image should be got`)
  }
  return (
    <Layout pageTitle={title}>
      <div>
        <h1>{title}</h1>
        <p className={ styles.date}>{ date}</p>
        <div className={ styles.photoInfo}>
            <GatsbyImage className={ styles.image}image={image} alt={hero_image_alt} />
          <p className={ styles.credit}>
            Photo Credit:{" "}
            <a href={hero_image_credit_link} className={ styles.creditLink}>
              {hero_image_credit_text}
            </a>
          </p>
        </div>
        <div className={styles.contents}>
          <MDXProvider components={{
            p: props => <p {...props} style={{ lineHeight: "2rem" }} />,
            ul: props => <ul {...props} style={{ listStyleType: "disc", listStylePosition: "inside", paddingTop:"10px", paddingBottom:"10px"}} />,
            ol: props => <ol {...props} style={{ listStylePosition: "inside", paddingTop:"10px", paddingBottom:"10px" }} />,
            li: props => <li {...props} style={{ lineHeight: "2rem", paddingLeft: "1rem" }} />,
          }}>
            <MDXRenderer>{body}</MDXRenderer>
          </MDXProvider>
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        date
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

